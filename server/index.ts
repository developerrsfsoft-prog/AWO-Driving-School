import cors from 'cors'
import dotenv from 'dotenv'
import express, { type Request } from 'express'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { randomUUID } from 'node:crypto'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import multer from 'multer'
import nodemailer from 'nodemailer'
import { del, put } from '@vercel/blob'
import { dbAll, dbExec, dbGet, dbRun, dbTransaction } from './db.js'
import type { InValue } from '@libsql/client'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const localDbPath = process.env.SQLITE_PATH ? path.resolve(process.env.SQLITE_PATH) : path.join(__dirname, 'data', 'awo.sqlite')
const distPath = path.resolve(__dirname, '..', 'dist')
const wwwrootPath = path.resolve(__dirname, '..', 'wwwroot')
const uploadsPath = path.resolve(process.env.UPLOADS_DIR || path.join(wwwrootPath, 'uploads'))
const usingTurso = Boolean(process.env.TURSO_DATABASE_URL && !process.env.TURSO_DATABASE_URL.startsWith('file:'))
const port = Number(process.env.PORT || 4000)
const jwtSecret = process.env.JWT_SECRET
const adminEmail = process.env.ADMIN_EMAIL
const adminPassword = process.env.ADMIN_PASSWORD
const frontendOrigins = (process.env.FRONTEND_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

if (!jwtSecret || jwtSecret.length < 32) {
  throw new Error('JWT_SECRET must be configured with at least 32 characters.')
}
if (!adminEmail || !z.string().email().safeParse(adminEmail).success) {
  throw new Error('ADMIN_EMAIL must be configured with a valid email address.')
}
if (!adminPassword || adminPassword.length < 12) {
  throw new Error('ADMIN_PASSWORD must be configured with at least 12 characters.')
}
if (process.env.VERCEL && !usingTurso) {
  throw new Error('TURSO_DATABASE_URL must point to a persistent Turso database on Vercel.')
}

const ensureDirectory = () => {
  if (!usingTurso) {
    fs.mkdirSync(path.dirname(localDbPath), { recursive: true })
  }
}

ensureDirectory()

type User = {
  id: number
  email: string
  name: string
  password_hash: string
  role: string
}

type BookingInput = {
  fullName: string
  phone: string
  email: string
  drivingExperience: string
  lessonType: string
  preferredDate: string
  preferredTime: string
  contactPreference: string
  message: string
}

function getRouteParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? '' : value ?? ''
}

function toSqlValue(value: unknown): InValue {
  if (
    value === null
    || typeof value === 'string'
    || typeof value === 'number'
    || typeof value === 'bigint'
    || value instanceof Uint8Array
  ) {
    return value
  }
  throw new Error('Unsupported database value.')
}

const pageSchema = z.object({
  slug: z.string().min(1).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  seoTitle: z.string().max(200).optional(),
  metaDescription: z.string().max(320).optional(),
  status: z.enum(['draft', 'published']).optional(),
  heroImageUrl: z.string().max(500).optional().default(''),
  heroImageAlt: z.string().max(300).optional().default(''),
  bannerImageUrl: z.string().max(500).optional().default(''),
  bannerImageAlt: z.string().max(300).optional().default(''),
  sections: z.array(
    z.object({
      heading: z.string().min(1).max(200),
      body: z.string().min(1).max(4000),
      items: z.array(z.string().max(500)).max(30).optional(),
      imageUrl: z.string().max(500).optional().default(''),
      imageAlt: z.string().max(300).optional().default(''),
    }),
  ).max(30),
})

const bookingSchema = z.object({
  fullName: z.string().min(2, 'Full name is required.'),
  phone: z.string().min(8, 'Please provide a valid phone number.'),
  email: z.string().email('Please provide a valid email address.'),
  drivingExperience: z.string().min(10, 'Please tell us about your goals.').max(1000),
  lessonType: z.string().min(2, 'Please choose a lesson type.'),
  preferredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Please provide a valid preferred date.'),
  preferredTime: z.string().regex(/^\d{2}:\d{2}$/, 'Please provide a valid preferred time.'),
  contactPreference: z.enum(['Email', 'Phone', 'Text message']),
  message: z.string().max(1000).optional().default(''),
})

const contactSchema = z.object({
  name: z.string().min(2, 'Please provide your name.'),
  email: z.string().email('Please provide a valid email address.'),
  phone: z.string().min(8, 'Please provide a valid phone number.'),
  message: z.string().min(10, 'Please provide a short message.'),
})

const app = express()
if (process.env.VERCEL) app.set('trust proxy', 1)
app.use(express.json({ limit: '2mb' }))
app.use(
  cors({
    origin: frontendOrigins,
    credentials: true,
  }),
)
app.use(
  helmet({
    contentSecurityPolicy: false,
  }),
)
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
  }),
)
const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
})

let databaseInitializationError: unknown
let databaseReady: Promise<void>

app.use('/api', async (_req, res, next) => {
  try {
    await databaseReady
    if (databaseInitializationError) throw databaseInitializationError
    next()
  } catch {
    res.status(503).json({ error: 'The service is temporarily unavailable.' })
  }
})

const initializeDatabase = async () => {
  ensureDirectory()
  if (!usingTurso) {
    await dbExec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;')
  }
  const migrationsDirectory = path.join(__dirname, 'migrations')
  await dbExec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      filename TEXT NOT NULL,
      applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `)
  const appliedMigrations = new Set(
    (await dbAll('SELECT version FROM schema_migrations', []) as Array<{ version: number }>).map(({ version }) => version),
  )
  const migrationFiles = fs.readdirSync(migrationsDirectory)
    .filter((filename) => /^\d+_.+\.sql$/.test(filename))
    .sort()

  for (const filename of migrationFiles) {
    const version = Number(filename.split('_', 1)[0])
    if (appliedMigrations.has(version)) {
      continue
    }

    const migration = fs.readFileSync(path.join(migrationsDirectory, filename), 'utf8')
    await dbTransaction(async (tx) => {
      await dbExec(migration, tx)
      await dbRun('INSERT INTO schema_migrations (version, filename) VALUES (?, ?)', [version, filename], tx)
    })
  }

  const adminUser = await dbGet('SELECT id FROM users WHERE email = ?', [adminEmail]) as { id: number } | undefined

  if (!usingTurso && !adminUser) {
    const passwordHash = await bcrypt.hash(adminPassword, 10)
    await dbRun(
      'INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)',
      [adminEmail, passwordHash, 'AWO Administrator', 'admin'],
    )
  }

  const seedSettings = await dbGet('SELECT id FROM site_settings WHERE key = ?', ['site_name']) as { id: number } | undefined
  if (!usingTurso && !seedSettings) {
    await dbRun(
      'INSERT INTO site_settings (key, value) VALUES (?, ?), (?, ?), (?, ?), (?, ?), (?, ?)',
      [
        'site_name', 'AWO Driving School', 'phone', '+44 7465 664828',
        'email', 'Awodivingschool@gmail.com', 'brand_tagline', 'Learn with calm confidence',
        'homepage_notice', 'Pricing and lesson availability are supplied by the business and can be managed in the admin dashboard.',
      ],
    )
  }

  // SMTP settings table
  await dbExec(`
    CREATE TABLE IF NOT EXISTS smtp_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      host TEXT NOT NULL DEFAULT '',
      port INTEGER NOT NULL DEFAULT 587,
      secure INTEGER NOT NULL DEFAULT 0,
      username TEXT NOT NULL DEFAULT '',
      password TEXT NOT NULL DEFAULT '',
      from_email TEXT NOT NULL DEFAULT '',
      from_name TEXT NOT NULL DEFAULT 'AWO Driving School',
      enabled INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `)
  const smtpCount = await dbGet('SELECT COUNT(*) AS total FROM smtp_settings', []) as { total: number }
  if (!usingTurso && smtpCount.total === 0) {
    await dbRun('INSERT INTO smtp_settings (host, port, secure, username, password, from_email, from_name, enabled) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', ['', 587, 0, '', '', 'Awodivingschool@gmail.com', 'AWO Driving School', 0])
  }

  // Email logs table
  await dbExec(`
    CREATE TABLE IF NOT EXISTS email_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      to_email TEXT NOT NULL,
      subject TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      error_message TEXT,
      sent_at TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Password reset tokens table
  await dbExec(`
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token TEXT NOT NULL UNIQUE,
      expires_at TEXT NOT NULL,
      used INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `)

  const pageCount = await dbGet('SELECT COUNT(*) AS total FROM pages', []) as { total: number }
  if (!usingTurso && pageCount.total === 0) {
    const pages = [
      {
        slug: 'home',
        title: 'Home',
        description: 'Supportive driving lessons and confidence-first coaching for beginners and nervous drivers.',
        seoTitle: 'AWO Driving School | Learn to drive with calm confidence',
        metaDescription: 'Patient, supportive driving lessons for beginners, nervous learners and confident test preparation in the UK.',
        sections: [
          {
            heading: 'Start with support and structure',
            body: 'AWO Driving School helps learners feel calmer about driving and make steady progress with every session.',
            items: ['Beginner-friendly teaching', 'Calm, supportive environment', 'Clear progression and realistic practice'],
          },
          {
            heading: 'Driving lessons for every stage',
            body: 'Whether you are starting from zero, preparing for test day or building confidence on different roads, your lessons can be shaped around your goals.',
            items: ['Nervous learner support', 'Confidence-focused instruction', 'In-lesson skill review'],
          },
        ],
      },
      {
        slug: 'about',
        title: 'About Us',
        description: 'AWO Driving School focuses on calm, practical coaching that helps learners feel more confident and capable on the road.',
        seoTitle: 'About AWO Driving School',
        metaDescription: 'Learn about AWO Driving School, our calm teaching style and how we support learners through each stage of their driving journey.',
        sections: [
          {
            heading: 'Patient teaching with a supportive approach',
            body: 'We teach in a structured and reassuring way, helping you grow your skills without feeling overwhelmed.',
            items: ['Safe habits', 'Clear feedback', 'Progressive learning'],
          },
          {
            heading: 'Confidence before pressure',
            body: 'A calmer approach helps you understand how to drive responsibly, react well in different conditions and enjoy the process more.',
            items: ['Built around your goals', 'Practical, realistic lessons', 'Ongoing encouragement'],
          },
        ],
      },
      {
        slug: 'driving-lessons',
        title: 'Driving Lessons',
        description: 'Practical, personalised tuition for beginners, refresher learners and those preparing for the driving test.',
        seoTitle: 'Driving Lessons | AWO Driving School',
        metaDescription: 'Discover driving lessons with AWO Driving School, from beginner support to refresher coaching and focused test preparation.',
        sections: [
          {
            heading: 'Structured learning for every learner',
            body: 'We design lessons around your current confidence level and the skills you want to build next.',
            items: ['Confidence-first teaching', 'Tailored learning plans', 'Practical road skills'],
          },
          {
            heading: 'What each lesson includes',
            body: 'Lessons focus on safe driving habits, road awareness and confidence in situations that matter most to you.',
            items: ['Progress reviews', 'Skill progression', 'Road awareness and safety'],
          },
        ],
      },
      {
        slug: 'beginner-driving-lessons',
        title: 'Beginner Driving Lessons',
        description: 'Begin with the key controls, road basics and calm, supportive instruction whether you are brand new to driving.',
        seoTitle: 'Beginner Driving Lessons | AWO Driving School',
        metaDescription: 'Start your driving journey with beginner-friendly lessons designed to build confidence, control and safe habits from the beginning.',
        sections: [
          {
            heading: 'A steady start',
            body: 'We begin with the essentials so you can develop control, confidence and road awareness at a manageable pace.',
            items: ['Controls and car familiarisation', 'Basic manoeuvres', 'Road safety habits'],
          },
          {
            heading: 'Your first drives',
            body: 'Each session is built to give you the right amount of practice and support, with space to ask questions and build skill gradually.',
            items: ['Step-by-step learning', 'Practical confidence-building', 'Clear feedback'],
          },
        ],
      },
      {
        slug: 'pay-as-you-go',
        title: 'Pay As You Go',
        description: 'Flexible, straightforward lesson options for learners who want to book as needed.',
        seoTitle: 'Pay As You Go Lessons',
        metaDescription: 'Flexible pay-as-you-go driving lessons from AWO Driving School, ideal for learners who want practical, progress-focused support.',
        sections: [
          {
            heading: 'Flexible lesson planning',
            body: 'Pay as you go gives you a straightforward option when you want to book lessons around your schedule and learning pace.',
            items: ['Flexible booking', 'Useful lesson structure', 'Adjustable support'],
          },
          {
            heading: 'Keep progressing without pressure',
            body: 'This approach works well for learners who want to build steadily and decide each step based on how they feel after each lesson.',
            items: ['Calm progression', 'Practical focus', 'Personalised feedback'],
          },
        ],
      },
      {
        slug: 'intensive-courses',
        title: 'Intensive Courses',
        description: 'Focused learning blocks designed to move you forward quickly with structure, practice and support.',
        seoTitle: 'Intensive Driving Courses',
        metaDescription: 'Explore intensive driving courses from AWO Driving School, offering focused learning and guided progress for learners ready to move faster.',
        sections: [
          {
            heading: 'Fast-paced learning',
            body: 'Intensive courses are for learners who want more frequent practice and a structured path toward more confident driving.',
            items: ['Focused learning blocks', 'Frequent practice', 'Progress tracking'],
          },
          {
            heading: 'Get the most from each session',
            body: 'Your coach will help you build a consistent routine and work on the practical skills that matter most in a shorter timeframe.',
            items: ['Clear structure', 'Road-ready practice', 'Confidence-building lessons'],
          },
        ],
      },
      {
        slug: 'fast-track-courses',
        title: 'Fast Track Courses',
        description: 'A more direct route for learners who want rapid progress with focused instruction and regular practice.',
        seoTitle: 'Fast Track Driving Courses',
        metaDescription: 'Fast track driving lessons from AWO Driving School focus on faster improvement and more confident road awareness for learners ready to move quickly.',
        sections: [
          {
            heading: 'A more targeted path',
            body: 'Fast track patterns help you concentrate on the key driving skills and decision-making habits needed to move forward efficiently.',
            items: ['Targeted practice', 'Clear lesson goals', 'Confidence-building rhythm'],
          },
          {
            heading: 'Progress with structure',
            body: 'Each lesson can be shaped around the skills you need next, helping you stay motivated and consistent.',
            items: ['Regular check-ins', 'Focused training', 'Progressive confidence'],
          },
        ],
      },
      {
        slug: 'refresher-lessons',
        title: 'Refresher Lessons',
        description: 'Helpful, confidence-focused lessons for returning drivers or anyone looking to rebuild confidence on the road.',
        seoTitle: 'Refresher Lessons | AWO Driving School',
        metaDescription: 'Refresher driving lessons from AWO Driving School help returning drivers rebuild confidence and sharpen road skills in a calm setting.',
        sections: [
          {
            heading: 'Build confidence gently',
            body: 'If it has been a while since you drove, refresher lessons can help you settle back in with calm, structured support.',
            items: ['Skill refresh', 'Boosted confidence', 'Calm return to driving'],
          },
          {
            heading: 'Focus on what matters',
            body: 'We work on the areas you want to feel more comfortable with, whether that is maneuvering, road awareness or confidence in traffic.',
            items: ['Road awareness', 'Competent lane control', 'Confidence under pressure'],
          },
        ],
      },
      {
        slug: 'test-preparation',
        title: 'Practical Driving Test Preparation',
        description: 'Focused prep for your practical driving test, with realistic practice, calm guidance and clear feedback.',
        seoTitle: 'Practical Driving Test Preparation',
        metaDescription: 'Prepare for your driving test with AWO Driving School through calm, realistic practice, targeted feedback and confidence-building lesson planning.',
        sections: [
          {
            heading: 'Test preparation with confidence',
            body: 'We work on the habits, decisions and control needed for your practical driving test while keeping the process calm and manageable.',
            items: ['Test-focused practice', 'Advanced road awareness', 'Confidence-building review'],
          },
          {
            heading: 'Get ready for each challenge',
            body: 'By practising realistic scenarios and giving constructive feedback, you can build the habits needed for a smoother driving test experience.',
            items: ['Clear lesson goals', 'Calm preparation', 'Road awareness tuning'],
          },
        ],
      },
      {
        slug: 'areas-we-cover',
        title: 'Areas We Cover',
        description: 'Learners can discuss their local area and the roads they want to become more confident driving on.',
        seoTitle: 'Areas We Cover',
        metaDescription: 'AWO Driving School supports learners across local areas. Use the form to discuss the routes and roads you want to practice.',
        sections: [
          {
            heading: 'Local roads, local confidence',
            body: 'The right roads to practise are the ones you are most likely to drive on after lessons. We can help you build confidence in your familiar local area.',
            items: ['Local route familiarity', 'Confidence across common roads', 'Practical preparation'],
          },
          {
            heading: 'Routes that matter to you',
            body: 'If there are specific roads, junctions or traffic situations you want more confidence with, they can be built into the lesson plan.',
            items: ['Route-specific practice', 'Junction confidence', 'Road awareness review'],
          },
        ],
      },
      {
        slug: 'faqs',
        title: 'FAQs',
        description: 'Helpful answers about lesson planning, learner confidence, and how to get started.',
        seoTitle: 'Driving School FAQs',
        metaDescription: 'Read common questions about AWO Driving School lessons, learner support, and getting started with driving tuition.',
        sections: [
          {
            heading: 'Common questions',
            body: 'The most helpful starting point is a friendly conversation about your experience and confidence level.',
            items: ['Nervous beginners welcome', 'Support for returning drivers', 'Flexible lesson planning'],
          },
        ],
      },
      {
        slug: 'contact',
        title: 'Contact',
        description: 'Get in touch to ask about lessons, availability and your driving goals.',
        seoTitle: 'Contact AWO Driving School',
        metaDescription: 'Contact AWO Driving School to ask about lessons, pricing availability and driving confidence support.',
        sections: [
          {
            heading: 'Get in touch',
            body: 'Use the contact form or phone line to discuss your goals, current experience and the kind of support you need.',
            items: ['Phone and email contact', 'Lesson enquiry support', 'Helpful next steps'],
          },
        ],
      },
      {
        slug: 'booking',
        title: 'Booking',
        description: 'Book a driving lesson enquiry and tell us about your goals, timing and learner profile.',
        seoTitle: 'Book a Lesson | AWO Driving School',
        metaDescription: 'Book a driving lesson enquiry with AWO Driving School and share the details that will help us support your learning goals.',
        sections: [
          {
            heading: 'Tell us what you need',
            body: 'Share your current experience, lesson preference and availability so the right next steps can be discussed.',
            items: ['Experience and needs', 'Preferred lesson type', 'Contact preferences'],
          },
        ],
      },
      {
        slug: 'privacy-policy',
        title: 'Privacy Policy',
        description: 'How AWO Driving School handles personal information provided through forms, contacts and student enquiries.',
        seoTitle: 'Privacy Policy',
        metaDescription: 'Review the AWO Driving School privacy policy for lesson enquiries, contact forms and personal data handling.',
        sections: [
          {
            heading: 'Data handling',
            body: 'We only collect and use the information needed to respond to lesson enquiries and support the driving learning process.',
            items: ['Contact details', 'Lesson enquiry information', 'Response and follow-up'],
          },
        ],
      },
      {
        slug: 'cookie-policy',
        title: 'Cookie Policy',
        description: 'A basic note on cookies, analytics and how website functionality is kept useful and respectful.',
        seoTitle: 'Cookie Policy',
        metaDescription: 'Read the AWO Driving School cookie policy to understand how site functionality and optional analytics may use cookies on the website.',
        sections: [
          {
            heading: 'Website cookies',
            body: 'We aim to use only the cookies needed for the website to function properly and to improve usability over time.',
            items: ['Essential functionality', 'Performance awareness', 'User preference support'],
          },
        ],
      },
      {
        slug: 'terms-and-conditions',
        title: 'Terms and Conditions',
        description: 'Information about lesson arrangements, communication expectations and customer responsibilities.',
        seoTitle: 'Terms and Conditions',
        metaDescription: 'Review the AWO Driving School terms and conditions covering lessons, communications, and learner responsibilities.',
        sections: [
          {
            heading: 'Lesson terms',
            body: 'All lesson arrangements, timings and support should be discussed and confirmed directly with AWO Driving School before attendance.',
            items: ['Lesson planning', 'Scheduling communication', 'Mutual responsibilities'],
          },
        ],
      },
    ] as const

    for (const page of pages) {
      const pageId = await dbRun(
        'INSERT INTO pages (slug, title, description, seo_title, meta_description, status) VALUES (?, ?, ?, ?, ?, ?)',
        [page.slug, page.title, page.description, page.seoTitle, page.metaDescription, 'published'],
      )
      if (pageId.lastInsertRowid === undefined) throw new Error('Page insert did not return an ID.')

      for (const [index, section] of page.sections.entries()) {
        await dbRun(
          'INSERT INTO page_sections (page_id, heading, body, items, sort_order) VALUES (?, ?, ?, ?, ?)',
          [pageId.lastInsertRowid, section.heading, section.body, JSON.stringify(section.items ?? []), index],
        )
      }
    }
  }

  const serviceCount = await dbGet('SELECT COUNT(*) AS total FROM services', []) as { total: number }
  if (!usingTurso && serviceCount.total === 0) {
    const services = [
      ['beginner-driving-lessons', 'Beginner Driving Lessons', 'Step-by-step learning for learners starting from zero.', 'Begin with the basics, master the controls and build road confidence in a calm way.'],
      ['refresher-lessons', 'Refresher Lessons', 'Support for learners returning to driving after a break.', 'Refresh your road awareness, control and confidence in a reassuring, practical setting.'],
      ['practical-driving-test-preparation', 'Practical Driving Test Preparation', 'Focused support for the lessons and habits that matter most on test day.', 'Work through realistic driving scenarios and sharpen the habits needed for successful test preparation.'],
      ['pay-as-you-go', 'Pay As You Go', 'Flexible booking for learners who want to plan as they go.', 'Choose the lesson rhythm that suits your confidence and schedule.'],
      ['intensive-courses', 'Intensive Courses', 'Structured learning blocks for quicker progress and more frequent practice.', 'Use a focused route to build skills efficiently and keep momentum moving.'],
      ['fast-track-courses', 'Fast Track Courses', 'Accelerate your progress with targeted lesson planning and regular practice.', 'Focus on what matters most to keep making clear progress.'],
    ] as const

    for (const [slug, title, summary, description] of services) {
      await dbRun(
        'INSERT INTO services (slug, title, summary, description, status) VALUES (?, ?, ?, ?, ?)',
        [slug, title, summary, description, 'published'],
      )
    }
  }

  const faqCount = await dbGet('SELECT COUNT(*) AS total FROM faqs', []) as { total: number }
  if (!usingTurso && faqCount.total === 0) {
    const faqRows = [
      ['Do you teach nervous beginners?', 'Yes. We work with learners at all stages and can begin gently with the basics and build confidence gradually.'],
      ['Can lessons be tailored to my current experience?', 'Yes. We can shape each lesson around your confidence, goals and the areas you want to improve.'],
      ['Are refreshers available?', 'Yes. Refresher lessons are a good option for learners returning to driving after time away from the road.'],
      ['How do I ask about availability and lesson packages?', 'Use the contact form or phone number on the website to discuss your needs and the best lesson options for you.'],
    ] as const

    for (const [question, answer] of faqRows) {
      await dbRun('INSERT INTO faqs (question, answer, published) VALUES (?, ?, ?)', [question, answer, 1])
    }
  }

  const areaCount = await dbGet('SELECT COUNT(*) AS total FROM service_areas', []) as { total: number }
  if (!usingTurso && areaCount.total === 0) {
    await dbRun('INSERT INTO service_areas (name, description, published) VALUES (?, ?, ?)', ['Local learner routes', 'Help learners practise the roads and junctions they are most likely to drive on day to day.', 1])
    await dbRun('INSERT INTO service_areas (name, description, published) VALUES (?, ?, ?)', ['Confidence building areas', 'Support learners who want to feel more relaxed in busier streets, roundabouts and local routes.', 1])
  }

  const pricingCount = await dbGet('SELECT COUNT(*) AS total FROM pricing_plans', []) as { total: number }
  if (!usingTurso && pricingCount.total === 0) {
    await dbRun('INSERT INTO pricing_plans (name, description, price, status) VALUES (?, ?, ?, ?)', ['Lesson planning', 'Discuss current learner needs and lesson format options', 'Available on request', 'draft'])
    await dbRun('INSERT INTO pricing_plans (name, description, price, status) VALUES (?, ?, ?, ?)', ['Test preparation', 'Support for practical test readiness and confidence building', 'Available on request', 'draft'])
    await dbRun('INSERT INTO pricing_plans (name, description, price, status) VALUES (?, ?, ?, ?)', ['Intensive learning', 'Focused progression for learners ready for regular practice', 'Available on request', 'draft'])
  }
}

databaseReady = initializeDatabase().catch((error) => {
  databaseInitializationError = error
  console.error('Database initialization failed:', error)
})

declare global {
  namespace Express {
    interface Request {
      user?: {
        email: string
        role: string
      }
    }
  }
}

const getAuthToken = (user: User) => jwt.sign({ email: user.email, role: user.role }, jwtSecret, { expiresIn: '8h' })

const requireAuth = async (req: Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required.' })
  }

  let decoded: { email: string; role: string }
  try {
    const token = authHeader.split(' ')[1]
    decoded = jwt.verify(token, jwtSecret) as { email: string; role: string }
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token.' })
  }

  const user = await dbGet('SELECT id, email, name, role, password_hash FROM users WHERE email = ?', [decoded.email]) as User | undefined
  if (!user) {
    return res.status(401).json({ error: 'Invalid token.' })
  }
  req.user = { email: user.email, role: user.role }
  next()
}

app.get('/api/health', async (_req, res) => {
  res.json({ ok: true, message: 'AWO Driving School API is running.' })
})

app.get('/api/site-settings', async (_req, res) => {
  const settings = await dbAll('SELECT key, value FROM site_settings', []) as Array<{ key: string; value: string }>
  res.json(
    Object.fromEntries(
      settings.map((setting) => [setting.key, setting.value]),
    ),
  )
})

app.get('/api/pages', async (_req, res) => {
  const pages = await dbAll('SELECT * FROM pages WHERE status = ? ORDER BY id ASC', ['published']) as Array<Record<string, unknown>>
  res.json(pages)
})

app.get('/api/pages/:slug', async (req, res) => {
  const page = await dbGet('SELECT * FROM pages WHERE slug = ? AND status = ?', [req.params.slug, 'published']) as Record<string, unknown> | undefined

  if (!page) {
    return res.status(404).json({ error: 'Page not found.' })
  }

  const sections = await dbAll(
    'SELECT heading, body, items, image_url, image_alt FROM page_sections WHERE page_id = ? ORDER BY sort_order ASC',
    [(page as { id: number }).id],
  ) as Array<{ heading: string; body: string; items: string | null; image_url: string | null; image_alt: string | null }>

  return res.json({
    ...page,
    heroImageUrl: (page as any).hero_image_url ?? '',
    heroImageAlt: (page as any).hero_image_alt ?? '',
    bannerImageUrl: (page as any).banner_image_url ?? '',
    bannerImageAlt: (page as any).banner_image_alt ?? '',
    sections: sections.map((section) => ({
      ...section,
      imageUrl: section.image_url ?? '',
      imageAlt: section.image_alt ?? '',
      items: section.items ? JSON.parse(section.items) : [],
    })),
  })
})

app.get('/api/services', async (_req, res) => {
  const services = await dbAll('SELECT * FROM services WHERE status = ? ORDER BY id ASC', ['published']) as Array<Record<string, unknown>>
  res.json(services)
})

app.get('/api/services/:slug', async (req, res) => {
  const service = await dbGet('SELECT * FROM services WHERE slug = ? AND status = ?', [req.params.slug, 'published']) as Record<string, unknown> | undefined
  if (!service) {
    return res.status(404).json({ error: 'Service not found.' })
  }
  res.json(service)
})

app.get('/api/faqs', async (_req, res) => {
  const faqs = await dbAll('SELECT * FROM faqs WHERE published = 1 ORDER BY id ASC', [])
  res.json(faqs)
})

app.get('/api/testimonials', async (_req, res) => {
  const testimonials = await dbAll('SELECT * FROM testimonials WHERE verified = 1 ORDER BY id DESC', [])
  res.json(testimonials)
})

app.get('/api/areas', async (_req, res) => {
  const areas = await dbAll('SELECT * FROM service_areas WHERE published = 1 ORDER BY id ASC', [])
  res.json(areas)
})

app.get('/api/pricing', async (_req, res) => {
  const pricing = await dbAll('SELECT * FROM pricing_plans WHERE status = ? ORDER BY id ASC', ['published']) as Array<Record<string, unknown>>
  res.json(pricing)
})

app.get('/api/gallery', async (_req, res) => {
  const items = await dbAll('SELECT * FROM gallery_items WHERE published = 1 ORDER BY sort_order ASC, id ASC', []) as Array<Record<string, unknown>>
  res.json(items.map((i) => ({ ...i, published: Boolean(i.published) })))
})

app.post('/api/bookings', async (req, res) => {
  const parsed = bookingSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() })
  }

  const payload = parsed.data as BookingInput
  const reference = `AWO-${randomUUID().replace(/-/g, '').toUpperCase()}`

  try {
    const result = await dbRun(
      `INSERT INTO bookings (
         booking_reference, full_name, phone, email, driving_experience, lesson_type,
         preferred_date, preferred_time, contact_preference, message, status
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new')`,
      [
        reference,
        payload.fullName,
        payload.phone,
        payload.email,
        payload.drivingExperience,
        payload.lessonType,
        payload.preferredDate,
        payload.preferredTime,
        payload.contactPreference,
        payload.message,
      ],
    )

    return res.status(201).json({
      ok: true,
      message: 'Booking submitted successfully.',
      bookingReference: reference,
      bookingId: Number(result.lastInsertRowid),
    })
  } catch (error) {
    console.error('Booking persistence failed:', error)
    return res.status(500).json({
      error: 'We could not save your booking right now. Please try again in a moment.',
    })
  }
})

app.post('/api/contact', async (req, res) => {
  const parsed = contactSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() })
  }

  try {
    await dbRun('INSERT INTO enquiries (name, email, phone, message, status) VALUES (?, ?, ?, ?, ?)', [
      parsed.data.name,
      parsed.data.email,
      parsed.data.phone,
      parsed.data.message,
      'new',
    ])

    return res.status(201).json({ ok: true, message: 'Your enquiry has been received.' })
  } catch (error) {
    console.error('Contact enquiry persistence failed:', error)
    return res.status(500).json({
      error: 'Unable to save your enquiry right now. Please try again in a moment.',
    })
  }
})

app.post('/api/admin/login', loginRateLimit, async (req, res) => {
  const credentials = z.object({ email: z.string().email(), password: z.string().min(6) }).safeParse(req.body)
  if (!credentials.success) {
    return res.status(400).json({ error: 'Valid email and password are required.' })
  }

  const user = await dbGet(
    'SELECT id, email, name, password_hash, role FROM users WHERE email = ?',
    [credentials.data.email],
  ) as User | undefined

  if (!user || !(await bcrypt.compare(credentials.data.password, user.password_hash))) {
    return res.status(401).json({ error: 'Incorrect email or password.' })
  }

  res.json({
    token: getAuthToken(user),
    user: {
      email: user.email,
      name: user.name,
      role: user.role,
    },
  })
})

app.post('/api/admin/forgot-password', async (req, res) => {
  const parsed = z.object({ email: z.string().email() }).safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Valid email is required.' })
  }
  const user = await dbGet('SELECT id, email FROM users WHERE email = ?', [parsed.data.email]) as { id: number; email: string } | undefined
  if (!user) {
    // Don't reveal whether email exists
    return res.json({ ok: true, message: 'If the email exists, a reset link has been sent.' })
  }
  const token = randomUUID()
  const expiresAt = new Date(Date.now() + 3600000).toISOString()
  await dbRun('INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)', [user.id, token, expiresAt])

  // Try to send email if SMTP enabled
  const smtp = await dbGet('SELECT * FROM smtp_settings LIMIT 1', []) as any
  if (smtp && smtp.enabled) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtp.host,
        port: smtp.port,
        secure: !!smtp.secure,
        auth: smtp.username ? { user: smtp.username, pass: smtp.password } : undefined,
      })
      const resetUrl = `${frontendOrigins[0]}/admin/reset-password?token=${encodeURIComponent(token)}`
      await transporter.sendMail({
        from: `"${smtp.from_name}" <${smtp.from_email}>`,
        to: user.email,
        subject: 'AWO Admin Password Reset',
        text: `Reset your password: ${resetUrl}`,
        html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. Link expires in 1 hour.</p>`,
      })
      await dbRun('INSERT INTO email_logs (to_email, subject, status, sent_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)', [user.email, 'AWO Admin Password Reset', 'sent'])
    } catch (err) {
      await dbRun('INSERT INTO email_logs (to_email, subject, status, error_message) VALUES (?, ?, ?, ?)', [user.email, 'AWO Admin Password Reset', 'failed', String(err)])
      console.error('SMTP send error:', err)
    }
  }

  res.json({ ok: true, message: 'If the email exists, a reset link has been sent.' })
})

app.post('/api/admin/reset-password', async (req, res) => {
  const parsed = z.object({ token: z.string().min(1), password: z.string().min(6) }).safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Token and password (min 6 chars) are required.' })
  }
  const resetToken = await dbGet('SELECT * FROM password_reset_tokens WHERE token = ? AND used = 0', [parsed.data.token]) as any
  if (!resetToken) {
    return res.status(400).json({ error: 'Invalid or expired reset token.' })
  }
  if (new Date(resetToken.expires_at) < new Date()) {
    return res.status(400).json({ error: 'Reset token has expired.' })
  }
  const passwordHash = await bcrypt.hash(parsed.data.password, 10)
  await dbTransaction(async (tx) => {
    const updated = await dbRun('UPDATE password_reset_tokens SET used = 1 WHERE id = ? AND used = 0', [resetToken.id], tx)
    if (!updated.changes) {
      throw new Error('Reset token was already used.')
    }
    await dbRun('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, resetToken.user_id], tx)
  })
  res.json({ ok: true, message: 'Password has been reset. You can now log in.' })
})

app.get('/api/admin/smtp', requireAuth, async (_req, res) => {
  const settings = await dbGet(
    `SELECT host, port, secure, username, from_email, from_name, enabled,
      CASE WHEN password = '' THEN 0 ELSE 1 END AS password_configured
     FROM smtp_settings ORDER BY id ASC LIMIT 1`,
  ) as Record<string, any> | undefined
  if (!settings) return res.status(404).json({ error: 'SMTP settings are not initialized.' })
  res.json({ ...settings, secure: Boolean(settings.secure), enabled: Boolean(settings.enabled) })
})

app.put('/api/admin/smtp', requireAuth, async (req, res) => {
  const schema = z.object({
    host: z.string().max(200),
    port: z.number().int().min(1).max(65535),
    secure: z.boolean(),
    username: z.string().max(200),
    password: z.string().max(500),
    from_email: z.string().email().max(320),
    from_name: z.string().max(200),
    enabled: z.boolean(),
  })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid SMTP settings.' })
  }
  const d = parsed.data
  await dbRun(`UPDATE smtp_settings SET host = ?, port = ?, secure = ?, username = ?,
    password = CASE WHEN ? = '' THEN password ELSE ? END,
    from_email = ?, from_name = ?, enabled = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1`, [
    d.host, d.port, d.secure ? 1 : 0, d.username, d.password, d.password, d.from_email, d.from_name, d.enabled ? 1 : 0,
  ])
  res.json({ ok: true })
})

app.post('/api/admin/smtp/test', requireAuth, async (_req, res) => {
  const settings = await dbGet('SELECT * FROM smtp_settings LIMIT 1', []) as any
  if (!settings || !settings.enabled) {
    return res.status(400).json({ error: 'SMTP is not configured or enabled.' })
  }
  try {
    const transporter = nodemailer.createTransport({
      host: settings.host,
      port: settings.port,
      secure: !!settings.secure,
      auth: settings.username ? { user: settings.username, pass: settings.password } : undefined,
    })
    await transporter.verify()
    const info = await transporter.sendMail({
      from: `"${settings.from_name}" <${settings.from_email}>`,
      to: settings.from_email,
      subject: 'AWO SMTP Test',
      text: 'SMTP configuration test successful.',
    })
    await dbRun('INSERT INTO email_logs (to_email, subject, status, sent_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)', [settings.from_email, 'AWO SMTP Test', 'sent'])
    res.json({ ok: true, messageId: info.messageId })
  } catch (err) {
    await dbRun('INSERT INTO email_logs (to_email, subject, status, error_message) VALUES (?, ?, ?, ?)', [settings.from_email, 'AWO SMTP Test', 'failed', String(err)])
    console.error('SMTP test failed:', err)
    res.status(500).json({ error: 'SMTP test failed. Check the settings and email logs.' })
  }
})

app.get('/api/admin/email-logs', requireAuth, async (_req, res) => {
  const logs = await dbAll('SELECT * FROM email_logs ORDER BY created_at DESC LIMIT 100', [])
  res.json(logs)
})

app.get('/api/admin/dashboard', requireAuth, async (_req, res) => {
  const totals = {
    bookings: Number((await dbGet('SELECT COUNT(*) AS total FROM bookings', []) as { total: number }).total),
    enquiries: Number((await dbGet('SELECT COUNT(*) AS total FROM enquiries', []) as { total: number }).total),
    services: Number((await dbGet('SELECT COUNT(*) AS total FROM services WHERE status = ?', ['published']) as { total: number }).total),
    pages: Number((await dbGet('SELECT COUNT(*) AS total FROM pages WHERE status = ?', ['published']) as { total: number }).total),
  }

  const recentBookings = await dbAll('SELECT * FROM bookings ORDER BY created_at DESC LIMIT 5', [])
  const recentEnquiries = await dbAll('SELECT * FROM enquiries ORDER BY created_at DESC LIMIT 5', [])

  res.json({
    totals,
    recentBookings,
    recentEnquiries,
  })
})

app.get('/api/admin/bookings', requireAuth, async (_req, res) => {
  const search = typeof _req.query.q === 'string' ? _req.query.q.trim().slice(0, 100) : ''
  const bookings = search
    ? await dbAll(
      'SELECT * FROM bookings WHERE booking_reference LIKE ? OR full_name LIKE ? OR email LIKE ? OR phone LIKE ? ORDER BY created_at DESC LIMIT 200',
      Array(4).fill(`%${search}%`),
    )
    : await dbAll('SELECT * FROM bookings ORDER BY created_at DESC LIMIT 200', [])
  res.json(bookings)
})

app.get('/api/admin/enquiries', requireAuth, async (req, res) => {
  const search = typeof req.query.q === 'string' ? req.query.q.trim().slice(0, 100) : ''
  const enquiries = search
    ? await dbAll(
      'SELECT * FROM enquiries WHERE name LIKE ? OR email LIKE ? OR phone LIKE ? OR message LIKE ? ORDER BY created_at DESC LIMIT 200',
      Array(4).fill(`%${search}%`),
    )
    : await dbAll('SELECT * FROM enquiries ORDER BY created_at DESC LIMIT 200', [])
  res.json(enquiries)
})

app.patch('/api/admin/bookings/:id/status', requireAuth, async (req, res) => {
  const schema = z.object({ status: z.enum(['new', 'contacted', 'confirmed', 'completed']) })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid booking status.' })
  }

  const result = await dbRun(
    'UPDATE bookings SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [parsed.data.status, Number(req.params.id)],
  )
  if (!result.changes) {
    return res.status(404).json({ error: 'Booking not found.' })
  }

  res.json({ ok: true, status: parsed.data.status })
})

app.patch('/api/admin/enquiries/:id/status', requireAuth, async (req, res) => {
  const schema = z.object({ status: z.enum(['new', 'contacted', 'confirmed', 'completed']) })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid enquiry status.' })
  }

  const result = await dbRun(
    'UPDATE enquiries SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [parsed.data.status, Number(req.params.id)],
  )
  if (!result.changes) {
    return res.status(404).json({ error: 'Enquiry not found.' })
  }

  res.json({ ok: true, status: parsed.data.status })
})

app.get('/api/admin/pages', requireAuth, async (req, res) => {
  const search = typeof req.query.q === 'string' ? req.query.q.trim().slice(0, 100) : ''
  const rows = search
    ? await dbAll('SELECT * FROM pages WHERE slug LIKE ? OR title LIKE ? ORDER BY id ASC', [`%${search}%`, `%${search}%`])
    : await dbAll('SELECT * FROM pages ORDER BY id ASC', [])
  const pages = await Promise.all((rows as Array<any>).map(async (page) => ({
    id: page.id,
    slug: page.slug,
    title: page.title,
    description: page.description,
    seoTitle: page.seo_title ?? '',
    metaDescription: page.meta_description ?? '',
    status: page.status,
    heroImageUrl: page.hero_image_url ?? '',
    heroImageAlt: page.hero_image_alt ?? '',
    bannerImageUrl: page.banner_image_url ?? '',
    bannerImageAlt: page.banner_image_alt ?? '',
    sections: (await dbAll(
      'SELECT heading, body, items, image_url, image_alt FROM page_sections WHERE page_id = ? ORDER BY sort_order ASC',
      [page.id],
    ) as Array<any>).map((section) => ({
      heading: section.heading,
      body: section.body,
      items: section.items ? JSON.parse(section.items) as string[] : [],
      imageUrl: section.image_url ?? '',
      imageAlt: section.image_alt ?? '',
    })),
  })))
  res.json(pages)
})

app.post('/api/admin/pages', requireAuth, async (req, res) => {
  const parsed = pageSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() })
  }

  const page = parsed.data
  try {
    const pageId = await dbTransaction(async (tx) => {
      const result = await dbRun(
        'INSERT INTO pages (slug, title, description, seo_title, meta_description, status, hero_image_url, hero_image_alt, banner_image_url, banner_image_alt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [page.slug, page.title, page.description, page.seoTitle ?? page.title, page.metaDescription ?? page.description, page.status ?? 'published', page.heroImageUrl ?? '', page.heroImageAlt ?? '', page.bannerImageUrl ?? '', page.bannerImageAlt ?? ''],
        tx,
      )
      if (result.lastInsertRowid === undefined) throw new Error('Page insert did not return an ID.')
      const id = Number(result.lastInsertRowid)
      for (const [index, section] of page.sections.entries()) {
        await dbRun(
          'INSERT INTO page_sections (page_id, heading, body, items, sort_order, image_url, image_alt) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [id, section.heading, section.body, JSON.stringify(section.items ?? []), index, section.imageUrl ?? '', section.imageAlt ?? ''],
          tx,
        )
      }
      return id
    })
    res.status(201).json({ ok: true, pageId })
  } catch (error) {
    if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'A page with this slug already exists.' })
    }
    throw error
  }
})

app.put('/api/admin/pages/:slug', requireAuth, async (req, res) => {
  const parsed = pageSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() })
  }
  const slug = getRouteParam(req.params.slug)
  const existing = await dbGet('SELECT id FROM pages WHERE slug = ?', [slug]) as { id: number } | undefined
  if (!existing) {
    return res.status(404).json({ error: 'Page not found.' })
  }

  const page = parsed.data
  try {
    await dbTransaction(async (tx) => {
      await dbRun(
        `UPDATE pages SET slug = ?, title = ?, description = ?, seo_title = ?, meta_description = ?,
         status = ?, hero_image_url = ?, hero_image_alt = ?, banner_image_url = ?, banner_image_alt = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [
          page.slug,
          page.title,
          page.description,
          page.seoTitle ?? page.title,
          page.metaDescription ?? page.description,
          page.status ?? 'published',
          page.heroImageUrl ?? '',
          page.heroImageAlt ?? '',
          page.bannerImageUrl ?? '',
          page.bannerImageAlt ?? '',
          existing.id,
        ],
        tx,
      )
      await dbRun('DELETE FROM page_sections WHERE page_id = ?', [existing.id], tx)
      for (const [index, section] of page.sections.entries()) {
        await dbRun(
          'INSERT INTO page_sections (page_id, heading, body, items, sort_order, image_url, image_alt) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [existing.id, section.heading, section.body, JSON.stringify(section.items ?? []), index, section.imageUrl ?? '', section.imageAlt ?? ''],
          tx,
        )
      }
    })
    res.json({ ok: true, slug: page.slug })
  } catch (error) {
    if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'A page with this slug already exists.' })
    }
    throw error
  }
})

app.delete('/api/admin/pages/:slug', requireAuth, async (req, res) => {
  const result = await dbRun('DELETE FROM pages WHERE slug = ?', [getRouteParam(req.params.slug)])
  if (!result.changes) {
    return res.status(404).json({ error: 'Page not found.' })
  }
  res.json({ ok: true })
})

const adminResources = {
  services: {
    table: 'services',
    primaryKey: 'id',
    searchable: ['slug', 'title', 'summary'],
    columns: ['slug', 'title', 'summary', 'description', 'status', 'image_url', 'image_alt'],
    schema: z.object({
      slug: z.string().min(1).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
      title: z.string().min(1).max(200),
      summary: z.string().min(1).max(500),
      description: z.string().min(1).max(4000),
      status: z.enum(['draft', 'published']),
      image_url: z.string().max(500).optional().default(''),
      image_alt: z.string().max(300).optional().default(''),
    }),
  },
  faqs: {
    table: 'faqs',
    primaryKey: 'id',
    searchable: ['question', 'answer'],
    columns: ['question', 'answer', 'published'],
    schema: z.object({
      question: z.string().min(1).max(500),
      answer: z.string().min(1).max(4000),
      published: z.boolean(),
    }),
  },
  testimonials: {
    table: 'testimonials',
    primaryKey: 'id',
    searchable: ['customer_name', 'quote'],
    columns: ['customer_name', 'quote', 'verified', 'image_url', 'image_alt'],
    schema: z.object({
      customer_name: z.string().min(1).max(200),
      quote: z.string().min(1).max(2000),
      verified: z.boolean(),
      image_url: z.string().max(500).optional().default(''),
      image_alt: z.string().max(300).optional().default(''),
    }),
  },
  areas: {
    table: 'service_areas',
    primaryKey: 'id',
    searchable: ['name', 'description'],
    columns: ['name', 'description', 'published'],
    schema: z.object({
      name: z.string().min(1).max(200),
      description: z.string().min(1).max(2000),
      published: z.boolean(),
    }),
  },
  pricing: {
    table: 'pricing_plans',
    primaryKey: 'id',
    searchable: ['name', 'description'],
    columns: ['name', 'description', 'price', 'status'],
    schema: z.object({
      name: z.string().min(1).max(200),
      description: z.string().min(1).max(2000),
      price: z.string().max(100).nullable(),
      status: z.enum(['draft', 'published']),
    }),
  },
  settings: {
    table: 'site_settings',
    primaryKey: 'key',
    searchable: ['key', 'value'],
    columns: ['key', 'value', 'description'],
    schema: z.object({
      key: z.string().min(1).max(100).regex(/^[a-z0-9_]+$/),
      value: z.string().max(4000),
      description: z.string().max(500).optional().default(''),
    }),
  },
  gallery: {
    table: 'gallery_items',
    primaryKey: 'id',
    searchable: ['title', 'description', 'image_url'],
    columns: ['title', 'description', 'image_url', 'alt_text', 'sort_order', 'published'],
    schema: z.object({
      title: z.string().max(200).default(''),
      description: z.string().max(1000).default(''),
      image_url: z.string().min(1).max(500),
      alt_text: z.string().max(300).default(''),
      sort_order: z.number().int().min(0).max(10000).default(0),
      published: z.boolean().default(true),
    }),
  },
  navigation: {
    table: 'navigation_items_cms',
    primaryKey: 'id',
    searchable: ['label', 'href'],
    columns: ['label', 'href', 'parent_id', 'sort_order', 'published'],
    schema: z.object({
      label: z.string().min(1).max(120),
      href: z.string().min(1).max(300),
      parent_id: z.number().int().positive().nullable().optional().default(null),
      sort_order: z.number().int().min(0).max(10000).default(0),
      published: z.boolean().default(true),
    }),
  },
  bookings: {
    table: 'bookings',
    primaryKey: 'id',
    searchable: ['booking_reference', 'full_name', 'email', 'phone'],
    columns: ['full_name', 'phone', 'email', 'driving_experience', 'lesson_type', 'preferred_date', 'preferred_time', 'contact_preference', 'message', 'status'],
    schema: z.object({
      full_name: z.string().min(2).max(200),
      phone: z.string().min(8).max(40),
      email: z.string().email().max(320),
      driving_experience: z.string().min(2).max(1000),
      lesson_type: z.string().min(2).max(200),
      preferred_date: z.string().min(1).max(20),
      preferred_time: z.string().min(1).max(20),
      contact_preference: z.enum(['Email', 'Phone', 'Text message']),
      message: z.string().max(1000).default(''),
      status: z.enum(['new', 'contacted', 'confirmed', 'completed']),
    }),
  },
  enquiries: {
    table: 'enquiries',
    primaryKey: 'id',
    searchable: ['name', 'email', 'phone', 'message'],
    columns: ['name', 'email', 'phone', 'message', 'status'],
    schema: z.object({
      name: z.string().min(2).max(200),
      email: z.string().email().max(320),
      phone: z.string().min(8).max(40),
      message: z.string().min(10).max(4000),
      status: z.enum(['new', 'contacted', 'confirmed', 'completed']),
    }),
  },
} as const

const resolveAdminResource = (name: string) => {
  if (!Object.hasOwn(adminResources, name)) {
    return undefined
  }
  return adminResources[name as keyof typeof adminResources]
}

app.get('/api/admin/:resource', requireAuth, async (req, res, next) => {
  const resourceName = getRouteParam(req.params.resource)
  const resource = resolveAdminResource(resourceName)
  if (!resource) {
    return next()
  }
  const search = typeof req.query.q === 'string' ? req.query.q.trim().slice(0, 100) : ''
  const where = search ? `WHERE ${resource.searchable.map((column) => `${column} LIKE ?`).join(' OR ')}` : ''
  const params = search ? resource.searchable.map(() => `%${search}%`) : []
  const rows = await dbAll(
    `SELECT * FROM ${resource.table} ${where} ORDER BY ${resource.primaryKey} DESC LIMIT 200`,
    params,
  ) as Array<Record<string, unknown>>
  const normalized = rows.map((row) => ({
    ...row,
    ...('published' in row ? { published: Boolean(row.published) } : {}),
    ...('verified' in row ? { verified: Boolean(row.verified) } : {}),
  }))
  res.json(normalized)
})

app.post('/api/admin/:resource', requireAuth, async (req, res, next) => {
  const resourceName = getRouteParam(req.params.resource)
  const resource = resolveAdminResource(resourceName)
  if (!resource) {
    return next()
  }
  const parsed = resource.schema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() })
  }
  const data = parsed.data as Record<string, unknown>
  const columns: string[] = resource.columns.filter((column) => column in data)
  const values = columns.map((column) => toSqlValue(typeof data[column] === 'boolean' ? Number(data[column]) : data[column]))
  if (resourceName === 'bookings') {
    columns.unshift('booking_reference')
    values.unshift(`AWO-${randomUUID().replace(/-/g, '').toUpperCase()}`)
  }
  try {
    const result = await dbRun(
      `INSERT INTO ${resource.table} (${columns.join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`,
      values,
    )
    res.status(201).json({ ok: true, id: resource.primaryKey === 'key' ? data.key : Number(result.lastInsertRowid) })
  } catch (error) {
    if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'A record with that identifier already exists.' })
    }
    throw error
  }
})

app.put('/api/admin/:resource/:id', requireAuth, async (req, res, next) => {
  const resource = resolveAdminResource(getRouteParam(req.params.resource))
  if (!resource) {
    return next()
  }
  const parsed = resource.schema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() })
  }
  const data = parsed.data as Record<string, unknown>
  const columns = resource.columns.filter((column) => column in data)
  const values = columns.map((column) => toSqlValue(typeof data[column] === 'boolean' ? Number(data[column]) : data[column]))
  const recordId = getRouteParam(req.params.id)
  const id = resource.primaryKey === 'id' ? Number(recordId) : recordId
  if (resource.primaryKey === 'id' && (!Number.isInteger(id) || Number(id) < 1)) {
    return res.status(400).json({ error: 'Invalid record identifier.' })
  }
  try {
    const result = await dbRun(
      `UPDATE ${resource.table} SET ${columns.map((column) => `${column} = ?`).join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE ${resource.primaryKey} = ?`,
      [...values, toSqlValue(id)],
    )
    if (!result.changes) {
      return res.status(404).json({ error: 'Record not found.' })
    }
    res.json({ ok: true })
  } catch (error) {
    if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'A record with that identifier already exists.' })
    }
    throw error
  }
})

app.delete('/api/admin/:resource/:id', requireAuth, async (req, res, next) => {
  const resource = resolveAdminResource(getRouteParam(req.params.resource))
  if (!resource) {
    return next()
  }
  const recordId = getRouteParam(req.params.id)
  const id = resource.primaryKey === 'id' ? Number(recordId) : recordId
  if (resource.primaryKey === 'id' && (!Number.isInteger(id) || Number(id) < 1)) {
    return res.status(400).json({ error: 'Invalid record identifier.' })
  }
  const result = await dbRun(
    `DELETE FROM ${resource.table} WHERE ${resource.primaryKey} = ?`,
    [id],
  )
  if (!result.changes) {
    return res.status(404).json({ error: 'Record not found.' })
  }
  res.json({ ok: true })
})

// ---- Media / uploads ----
const ALLOWED_IMAGE_TYPES = new Map([
  ['.jpg', { mime: 'image/jpeg', signature: (buffer: Buffer) => buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff }],
  ['.jpeg', { mime: 'image/jpeg', signature: (buffer: Buffer) => buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff }],
  ['.png', { mime: 'image/png', signature: (buffer: Buffer) => buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) }],
  ['.webp', { mime: 'image/webp', signature: (buffer: Buffer) => buffer.length >= 12 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP' }],
])
const MAX_IMAGE_BYTES = 5 * 1024 * 1024
type StoredUpload = {
  filename: string
  url: string
  folder: string
  mimeType: string
  size: number
  blob: boolean
  localPath?: string
}

function sanitizeBaseName(name: string) {
  return name.replace(/\.[^.]+$/, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'image'
}

function validateImage(file: Express.Multer.File) {
  const extension = path.extname(file.originalname).toLowerCase()
  const type = ALLOWED_IMAGE_TYPES.get(extension)
  if (!type || file.mimetype !== type.mime || !type.signature(file.buffer)) {
    throw new Error('Unsupported or invalid image content. Allowed: JPG, PNG, WebP.')
  }
  return { extension, mimeType: type.mime }
}

async function storeUpload(file: Express.Multer.File): Promise<StoredUpload> {
  const { extension, mimeType } = validateImage(file)
  const now = new Date()
  const folder = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}`
  const filename = `${sanitizeBaseName(file.originalname)}-${randomUUID()}${extension}`
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`awo-uploads/${folder}/${filename}`, file.buffer, {
      access: 'public',
      addRandomSuffix: false,
      contentType: mimeType,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    })
    return { filename, url: blob.url, folder, mimeType, size: file.size, blob: true }
  }
  if (usingTurso) {
    throw new Error('BLOB_READ_WRITE_TOKEN is required for production media uploads.')
  }
  const localDirectory = path.join(uploadsPath, folder)
  await fs.promises.mkdir(localDirectory, { recursive: true })
  const localPath = path.join(localDirectory, filename)
  await fs.promises.writeFile(localPath, file.buffer, { flag: 'wx' })
  return { filename, url: `/uploads/${folder}/${filename}`, folder, mimeType, size: file.size, blob: false, localPath }
}

async function deleteStoredUpload(url: string) {
  if (url.startsWith('https://') && process.env.BLOB_READ_WRITE_TOKEN) {
    await del(url, { token: process.env.BLOB_READ_WRITE_TOKEN })
  } else if (url.startsWith('/uploads/')) {
    const root = path.resolve(uploadsPath)
    const relativePath = decodeURIComponent(url.slice('/uploads/'.length))
    const localPath = path.resolve(root, relativePath)
    if (!localPath.startsWith(root + path.sep)) throw new Error('Invalid local media path.')
    try {
      await fs.promises.unlink(localPath)
    } catch (error) {
      if (!(error instanceof Error && 'code' in error && error.code === 'ENOENT')) throw error
    }
  }
}

async function discardNewUpload(uploadInfo: StoredUpload) {
  if (uploadInfo.blob) {
    await deleteStoredUpload(uploadInfo.url)
  } else if (uploadInfo.localPath) {
    await fs.promises.unlink(uploadInfo.localPath)
  }
}

async function countMediaUsage(url: string) {
  if (!url) return 0
  const result = await dbGet(
    `SELECT
      (SELECT COUNT(*) FROM pages WHERE hero_image_url = ? OR banner_image_url = ?) +
      (SELECT COUNT(*) FROM page_sections WHERE image_url = ?) +
      (SELECT COUNT(*) FROM services WHERE image_url = ?) +
      (SELECT COUNT(*) FROM testimonials WHERE image_url = ?) +
      (SELECT COUNT(*) FROM gallery_items WHERE image_url = ?) +
      (SELECT COUNT(*) FROM site_settings WHERE value = ? AND (key LIKE '%image%' OR key LIKE '%logo%' OR key LIKE '%banner%' OR key LIKE '%favicon%')) AS usage_count`,
    [url, url, url, url, url, url, url],
  ) as { usage_count: number | bigint } | undefined
  return Number(result?.usage_count ?? 0)
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_BYTES, files: 20 },
  fileFilter: (_req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase()
    const type = ALLOWED_IMAGE_TYPES.get(extension)
    if (!type || file.mimetype !== type.mime) {
      return cb(new Error('Unsupported image type. Allowed: JPG, PNG, WebP.'))
    }
    cb(null, true)
  },
})

async function receiveUploads(req: Request, res: express.Response, multiple: boolean) {
  await new Promise<void>((resolve, reject) => {
    const middleware = multiple ? upload.array('files', 20) : upload.single('file')
    middleware(req, res, (error) => error ? reject(error) : resolve())
  })
}

function normalizeMediaRow(row: Record<string, any>) {
  return {
    id: row.id,
    kind: row.kind || 'image',
    filename: row.filename,
    original_name: row.original_name || row.filename,
    url: row.url,
    alt_text: row.alt_text || '',
    mime_type: row.mime_type || '',
    file_size: row.file_size || 0,
    width: row.width || null,
    height: row.height || null,
    folder: row.folder || '',
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

app.get('/api/admin/media', requireAuth, async (req, res) => {
  const q = typeof req.query.q === 'string' ? req.query.q.trim().slice(0, 100) : ''
  const type = typeof req.query.type === 'string' ? req.query.type.trim() : ''
  const rows = (q
    ? await dbAll('SELECT * FROM media WHERE filename LIKE ? OR original_name LIKE ? OR url LIKE ? ORDER BY id DESC LIMIT 500', [`%${q}%`, `%${q}%`, `%${q}%`])
    : await dbAll('SELECT * FROM media ORDER BY id DESC LIMIT 500', [])) as Array<Record<string, any>>
  let items = rows.map(normalizeMediaRow)
  if (type) items = items.filter((item) => item.mime_type.includes(type) || item.filename.toLowerCase().endsWith(type))
  items = await Promise.all(items.map(async (item) => ({ ...item, usage_count: await countMediaUsage(item.url) })))
  res.json(items)
})

app.post('/api/admin/media/upload', requireAuth, async (req, res) => {
  try {
    await receiveUploads(req, res, true)
  } catch (error) {
    return res.status(400).json({ error: error instanceof Error ? error.message : 'Upload failed.' })
  }
  const files = (req.files as Express.Multer.File[] | undefined) ?? []
  if (!files.length) return res.status(400).json({ error: 'No image file provided.' })
  try {
    for (const file of files) validateImage(file)
  } catch (error) {
    return res.status(400).json({ error: error instanceof Error ? error.message : 'Unsupported image.' })
  }
  if (usingTurso && !process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(503).json({ error: 'Persistent media storage is not configured.' })
  }

  const alt = typeof req.body?.alt_text === 'string' ? String(req.body.alt_text).slice(0, 300) : ''
  const stored: StoredUpload[] = []
  try {
    for (const file of files) stored.push(await storeUpload(file))
    const items = await dbTransaction(async (tx) => {
      const inserted: Array<Record<string, unknown>> = []
      for (const [index, uploadInfo] of stored.entries()) {
        const file = files[index]
        const result = await dbRun(
          'INSERT INTO media (kind, filename, original_name, url, alt_text, mime_type, file_size, folder) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          ['image', uploadInfo.filename, file.originalname.slice(0, 255), uploadInfo.url, alt, uploadInfo.mimeType, uploadInfo.size, uploadInfo.folder],
          tx,
        )
        if (result.lastInsertRowid === undefined) throw new Error('Media insert did not return an ID.')
        const row = await dbGet('SELECT * FROM media WHERE id = ?', [result.lastInsertRowid], tx) as Record<string, any>
        inserted.push(normalizeMediaRow(row))
      }
      return inserted
    })
    return res.status(201).json({ ok: true, items, item: items[0] })
  } catch (error) {
    for (const uploadInfo of stored) {
      try {
        await discardNewUpload(uploadInfo)
      } catch (cleanupError) {
        console.error('Failed to clean up an unreferenced media upload:', cleanupError)
      }
    }
    console.error('Media upload failed:', error)
    return res.status(500).json({ error: 'Media upload failed. Please try again.' })
  }
})

app.put('/api/admin/media/:id', requireAuth, async (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id < 1) return res.status(400).json({ error: 'Invalid media id.' })
  const existing = await dbGet('SELECT * FROM media WHERE id = ?', [id]) as Record<string, any> | undefined
  if (!existing) return res.status(404).json({ error: 'Media not found.' })
  if (String(req.headers['content-type'] ?? '').includes('multipart/form-data')) {
    try {
      await receiveUploads(req, res, false)
    } catch (error) {
      return res.status(400).json({ error: error instanceof Error ? error.message : 'Replacement upload failed.' })
    }
    const file = req.file
    if (!file) return res.status(400).json({ error: 'No replacement file provided.' })
    try {
      validateImage(file)
    } catch (error) {
      return res.status(400).json({ error: error instanceof Error ? error.message : 'Unsupported image.' })
    }
    if (usingTurso && !process.env.BLOB_READ_WRITE_TOKEN) {
      return res.status(503).json({ error: 'Persistent media storage is not configured.' })
    }
    let uploadInfo: StoredUpload | undefined
    try {
      const newUpload = await storeUpload(file)
      uploadInfo = newUpload
      const oldUrl = String(existing.url ?? '')
      const row = await dbTransaction(async (tx) => {
        await dbRun(
          'UPDATE media SET filename = ?, original_name = ?, url = ?, mime_type = ?, file_size = ?, folder = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [newUpload.filename, file.originalname.slice(0, 255), newUpload.url, newUpload.mimeType, newUpload.size, newUpload.folder, id],
          tx,
        )
        if (oldUrl && oldUrl !== newUpload.url) {
          for (const table of ['pages', 'page_sections', 'services', 'testimonials', 'gallery_items']) {
            if (table === 'pages') {
              await dbRun('UPDATE pages SET hero_image_url = ? WHERE hero_image_url = ?', [newUpload.url, oldUrl], tx)
              await dbRun('UPDATE pages SET banner_image_url = ? WHERE banner_image_url = ?', [newUpload.url, oldUrl], tx)
            } else {
              await dbRun(`UPDATE ${table} SET image_url = ? WHERE image_url = ?`, [newUpload.url, oldUrl], tx)
            }
          }
          await dbRun("UPDATE site_settings SET value = ? WHERE value = ? AND (key LIKE '%image%' OR key LIKE '%logo%' OR key LIKE '%banner%' OR key LIKE '%favicon%')", [newUpload.url, oldUrl], tx)
        }
        const updatedRow = await dbGet('SELECT * FROM media WHERE id = ?', [id], tx) as Record<string, any> | undefined
        if (!updatedRow) throw new Error('Updated media record could not be read.')
        return updatedRow
      })
      return res.json({ ok: true, item: normalizeMediaRow(row) })
    } catch (error) {
      if (uploadInfo) {
        try {
          await discardNewUpload(uploadInfo)
        } catch (cleanupError) {
          console.error('Failed to clean up an unreferenced replacement image:', cleanupError)
        }
      }
      console.error('Media replacement failed:', error)
      return res.status(500).json({ error: 'Media replacement failed. Please try again.' })
    }
  }
  const alt = typeof req.body?.alt_text === 'string' ? String(req.body.alt_text).slice(0, 300) : (existing.alt_text || '')
  await dbRun('UPDATE media SET alt_text = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [alt, id])
  const row = await dbGet('SELECT * FROM media WHERE id = ?', [id]) as Record<string, any>
  res.json({ ok: true, item: normalizeMediaRow(row) })
})

app.delete('/api/admin/media/:id', requireAuth, async (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id < 1) return res.status(400).json({ error: 'Invalid media id.' })
  const existing = await dbGet('SELECT * FROM media WHERE id = ?', [id]) as Record<string, any> | undefined
  if (!existing) return res.status(404).json({ error: 'Media not found.' })
  const url = String(existing.url ?? '')
  const force = String(req.query.force ?? '') === 'true'
  if (url.startsWith('https://') && !process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(503).json({ error: 'Persistent media storage is not configured.' })
  }
  const usage = await countMediaUsage(url)
  if (usage > 0 && !force) {
    return res.status(409).json({ error: 'Image is in use. Confirm deletion to remove references and file.', usage })
  }
  await dbTransaction(async (tx) => {
    if (usage > 0) {
      await dbRun("UPDATE pages SET hero_image_url = '' WHERE hero_image_url = ?", [url], tx)
      await dbRun("UPDATE pages SET banner_image_url = '' WHERE banner_image_url = ?", [url], tx)
      await dbRun("UPDATE page_sections SET image_url = '' WHERE image_url = ?", [url], tx)
      await dbRun("UPDATE services SET image_url = '' WHERE image_url = ?", [url], tx)
      await dbRun("UPDATE testimonials SET image_url = '' WHERE image_url = ?", [url], tx)
      await dbRun('DELETE FROM gallery_items WHERE image_url = ?', [url], tx)
      await dbRun("UPDATE site_settings SET value = '' WHERE value = ? AND (key LIKE '%image%' OR key LIKE '%logo%' OR key LIKE '%banner%' OR key LIKE '%favicon%')", [url], tx)
    }
    await dbRun('DELETE FROM media WHERE id = ?', [id], tx)
  })
  await deleteStoredUpload(url)
  res.json({ ok: true })
})

if (!usingTurso) {
  app.use('/uploads', express.static(uploadsPath))
}

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath))
  app.get(/^(?!\/api).+/, async (_req, res) => {
    res.sendFile('index.html', { root: distPath })
  })
} else {
  app.get(/^(?!\/api).+/, async (_req, res) => {
    res.status(200).json({ message: 'Frontend build missing. Run npm run build or use Vite dev server.' })
  })
}

if (!process.env.VERCEL && process.env.APP_DISABLE_LISTEN !== '1') {
  app.listen(port, () => {
    console.log(`AWO API listening on http://localhost:${port}`)
  })
}

export default app

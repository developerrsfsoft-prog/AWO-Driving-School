import cors from 'cors'
import dotenv from 'dotenv'
import express, { type Request } from 'express'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import Database from 'better-sqlite3'
import { z } from 'zod'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const dbPath = path.join(__dirname, 'data', 'awo.sqlite')
const distPath = path.resolve(process.cwd(), 'dist')
const port = Number(process.env.PORT || 4000)
const jwtSecret = process.env.JWT_SECRET || 'development-secret-change-me'
const adminEmail = process.env.ADMIN_EMAIL || 'admin@awo-driving-school.local'
const adminPassword = process.env.ADMIN_PASSWORD || 'change-me-in-local-dev'

const ensureDirectory = () => {
  const directory = path.dirname(dbPath)
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true })
  }
}

ensureDirectory()
const db = new Database(dbPath)
db.pragma('journal_mode = WAL')

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

const pageSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  seoTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  sections: z.array(
    z.object({
      heading: z.string().min(1),
      body: z.string().min(1),
      items: z.array(z.string()).optional(),
    }),
  ),
})

const bookingSchema = z.object({
  fullName: z.string().min(2, 'Full name is required.'),
  phone: z.string().min(8, 'Please provide a valid phone number.'),
  email: z.string().email('Please provide a valid email address.'),
  drivingExperience: z.string().min(2, 'Please tell us your driving experience.'),
  lessonType: z.string().min(2, 'Please choose a lesson type.'),
  preferredDate: z.string().min(1, 'Please provide a preferred date.'),
  preferredTime: z.string().min(1, 'Please provide a preferred time.'),
  contactPreference: z.string().min(2, 'Please choose a contact preference.'),
  message: z.string().max(1000).optional().default(''),
})

const contactSchema = z.object({
  name: z.string().min(2, 'Please provide your name.'),
  email: z.string().email('Please provide a valid email address.'),
  phone: z.string().min(8, 'Please provide a valid phone number.'),
  message: z.string().min(10, 'Please provide a short message.'),
})

const app = express()
app.use(express.json({ limit: '2mb' }))
app.use(
  cors({
    origin: true,
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

const initializeDatabase = () => {
  ensureDirectory()
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      summary TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'published',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS pages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      seo_title TEXT,
      meta_description TEXT,
      status TEXT NOT NULL DEFAULT 'published',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS page_sections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      page_id INTEGER NOT NULL,
      heading TEXT NOT NULL,
      body TEXT NOT NULL,
      items TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(page_id) REFERENCES pages(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS faqs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      published INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS testimonials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_name TEXT NOT NULL,
      quote TEXT NOT NULL,
      verified INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS service_areas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      published INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS pricing_plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      price TEXT,
      status TEXT NOT NULL DEFAULT 'draft',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_reference TEXT UNIQUE NOT NULL,
      full_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL,
      driving_experience TEXT NOT NULL,
      lesson_type TEXT NOT NULL,
      preferred_date TEXT NOT NULL,
      preferred_time TEXT NOT NULL,
      contact_preference TEXT NOT NULL,
      message TEXT,
      status TEXT NOT NULL DEFAULT 'new',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS enquiries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'new',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS site_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      value TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS navigation_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      label TEXT NOT NULL,
      href TEXT NOT NULL,
      position INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS media (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      kind TEXT NOT NULL,
      filename TEXT NOT NULL,
      url TEXT NOT NULL,
      alt_text TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS contact_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'new',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
    CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
    CREATE INDEX IF NOT EXISTS idx_enquiries_status ON enquiries(status);
    CREATE INDEX IF NOT EXISTS idx_services_status ON services(status);
  `)

  const adminUser = db.prepare('SELECT id FROM users WHERE email = ?').get(adminEmail) as User | undefined

  if (!adminUser) {
    const passwordHash = bcrypt.hashSync(adminPassword, 10)
    db.prepare(
      'INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)',
    ).run(adminEmail, passwordHash, 'AWO Administrator', 'admin')
  }

  const seedSettings = db.prepare('SELECT id FROM site_settings WHERE key = ?').get('site_name') as { id: number } | undefined
  if (!seedSettings) {
    db.prepare(
      'INSERT INTO site_settings (key, value) VALUES (?, ?), (?, ?), (?, ?), (?, ?), (?, ?)',
    ).run(
      'site_name',
      'AWO Driving School',
      'phone',
      '+44 7465 664828',
      'email',
      'Awodivingschool@gmail.com',
      'brand_tagline',
      'Learn with calm confidence',
      'homepage_notice',
      'Pricing and lesson availability are supplied by the business and can be managed in the admin dashboard.',
    )
  }

  const pageCount = db.prepare('SELECT COUNT(*) AS total FROM pages').get() as { total: number }
  if (pageCount.total === 0) {
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

    const insertPageStatement = db.prepare(
      'INSERT INTO pages (slug, title, description, seo_title, meta_description, status) VALUES (?, ?, ?, ?, ?, ?)',
    )

    for (const page of pages) {
      const pageId = insertPageStatement.run(
        page.slug,
        page.title,
        page.description,
        page.seoTitle,
        page.metaDescription,
        'published',
      ) as { lastInsertRowid: number }

      const sectionInsert = db.prepare(
        'INSERT INTO page_sections (page_id, heading, body, items, sort_order) VALUES (?, ?, ?, ?, ?)',
      )

      page.sections.forEach((section, index) => {
        sectionInsert.run(pageId.lastInsertRowid, section.heading, section.body, JSON.stringify(section.items ?? []), index)
      })
    }
  }

  const serviceCount = db.prepare('SELECT COUNT(*) AS total FROM services').get() as { total: number }
  if (serviceCount.total === 0) {
    const services = [
      ['beginner-driving-lessons', 'Beginner Driving Lessons', 'Step-by-step learning for learners starting from zero.', 'Begin with the basics, master the controls and build road confidence in a calm way.'],
      ['refresher-lessons', 'Refresher Lessons', 'Support for learners returning to driving after a break.', 'Refresh your road awareness, control and confidence in a reassuring, practical setting.'],
      ['practical-driving-test-preparation', 'Practical Driving Test Preparation', 'Focused support for the lessons and habits that matter most on test day.', 'Work through realistic driving scenarios and sharpen the habits needed for successful test preparation.'],
      ['pay-as-you-go', 'Pay As You Go', 'Flexible booking for learners who want to plan as they go.', 'Choose the lesson rhythm that suits your confidence and schedule.'],
      ['intensive-courses', 'Intensive Courses', 'Structured learning blocks for quicker progress and more frequent practice.', 'Use a focused route to build skills efficiently and keep momentum moving.'],
      ['fast-track-courses', 'Fast Track Courses', 'Accelerate your progress with targeted lesson planning and regular practice.', 'Focus on what matters most to keep making clear progress.'],
    ] as const

    const insertService = db.prepare(
      'INSERT INTO services (slug, title, summary, description, status) VALUES (?, ?, ?, ?, ?)',
    )
    services.forEach(([slug, title, summary, description]) => {
      insertService.run(slug, title, summary, description, 'published')
    })
  }

  const faqCount = db.prepare('SELECT COUNT(*) AS total FROM faqs').get() as { total: number }
  if (faqCount.total === 0) {
    const faqRows = [
      ['Do you teach nervous beginners?', 'Yes. We work with learners at all stages and can begin gently with the basics and build confidence gradually.'],
      ['Can lessons be tailored to my current experience?', 'Yes. We can shape each lesson around your confidence, goals and the areas you want to improve.'],
      ['Are refreshers available?', 'Yes. Refresher lessons are a good option for learners returning to driving after time away from the road.'],
      ['How do I ask about availability and lesson packages?', 'Use the contact form or phone number on the website to discuss your needs and the best lesson options for you.'],
    ] as const

    const insertFaq = db.prepare('INSERT INTO faqs (question, answer, published) VALUES (?, ?, ?)')
    faqRows.forEach(([question, answer]) => insertFaq.run(question, answer, 1))
  }

  const areaCount = db.prepare('SELECT COUNT(*) AS total FROM service_areas').get() as { total: number }
  if (areaCount.total === 0) {
    const insertArea = db.prepare('INSERT INTO service_areas (name, description, published) VALUES (?, ?, ?)')
    insertArea.run('Local learner routes', 'Help learners practise the roads and junctions they are most likely to drive on day to day.', 1)
    insertArea.run('Confidence building areas', 'Support learners who want to feel more relaxed in busier streets, roundabouts and local routes.', 1)
  }

  const pricingCount = db.prepare('SELECT COUNT(*) AS total FROM pricing_plans').get() as { total: number }
  if (pricingCount.total === 0) {
    const insertPlan = db.prepare('INSERT INTO pricing_plans (name, description, price, status) VALUES (?, ?, ?, ?)')
    insertPlan.run('Lesson planning', 'Discuss current learner needs and lesson format options', 'Available on request', 'draft')
    insertPlan.run('Test preparation', 'Support for practical test readiness and confidence building', 'Available on request', 'draft')
    insertPlan.run('Intensive learning', 'Focused progression for learners ready for regular practice', 'Available on request', 'draft')
  }
}

initializeDatabase()

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

const requireAuth = (req: Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required.' })
  }

  try {
    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, jwtSecret) as { email: string; role: string }
    const user = db
      .prepare('SELECT id, email, name, role, password_hash FROM users WHERE email = ?')
      .get(decoded.email) as User | undefined

    if (!user) {
      return res.status(401).json({ error: 'Invalid token.' })
    }

    req.user = { email: user.email, role: user.role }
    next()
  } catch (_error) {
    return res.status(401).json({ error: 'Invalid or expired token.' })
  }
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, message: 'AWO Driving School API is running.' })
})

app.get('/api/site-settings', (_req, res) => {
  const settings = db.prepare('SELECT key, value FROM site_settings').all() as Array<{ key: string; value: string }>
  res.json(
    Object.fromEntries(
      settings.map((setting) => [setting.key, setting.value]),
    ),
  )
})

app.get('/api/pages', (_req, res) => {
  const pages = db.prepare('SELECT * FROM pages WHERE status = ? ORDER BY id ASC').all('published') as Array<Record<string, unknown>>
  res.json(pages)
})

app.get('/api/pages/:slug', (req, res) => {
  const page = db
    .prepare('SELECT * FROM pages WHERE slug = ? AND status = ?')
    .get(req.params.slug, 'published') as Record<string, unknown> | undefined

  if (!page) {
    return res.status(404).json({ error: 'Page not found.' })
  }

  const sections = db
    .prepare('SELECT heading, body, items FROM page_sections WHERE page_id = ? ORDER BY sort_order ASC')
    .all((page as { id: number }).id) as Array<{ heading: string; body: string; items: string | null }>

  return res.json({
    ...page,
    sections: sections.map((section) => ({
      ...section,
      items: section.items ? JSON.parse(section.items) : [],
    })),
  })
})

app.get('/api/services', (_req, res) => {
  const services = db.prepare('SELECT * FROM services WHERE status = ? ORDER BY id ASC').all('published') as Array<Record<string, unknown>>
  res.json(services)
})

app.get('/api/services/:slug', (req, res) => {
  const service = db.prepare('SELECT * FROM services WHERE slug = ? AND status = ?').get(req.params.slug, 'published') as Record<string, unknown> | undefined
  if (!service) {
    return res.status(404).json({ error: 'Service not found.' })
  }
  res.json(service)
})

app.get('/api/faqs', (_req, res) => {
  const faqs = db.prepare('SELECT * FROM faqs WHERE published = 1 ORDER BY id ASC').all()
  res.json(faqs)
})

app.get('/api/testimonials', (_req, res) => {
  const testimonials = db.prepare('SELECT * FROM testimonials WHERE verified = 1 ORDER BY id DESC').all()
  res.json(testimonials)
})

app.get('/api/areas', (_req, res) => {
  const areas = db.prepare('SELECT * FROM service_areas WHERE published = 1 ORDER BY id ASC').all()
  res.json(areas)
})

app.get('/api/pricing', (_req, res) => {
  const pricing = db.prepare('SELECT * FROM pricing_plans WHERE status = ? ORDER BY id ASC').all('draft') as Array<Record<string, unknown>>
  res.json(pricing)
})

app.post('/api/bookings', (req, res) => {
  const parsed = bookingSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() })
  }

  const payload = parsed.data as BookingInput
  const reference = `AWO-${Date.now().toString().slice(-6)}`

  try {
    const result = db
      .prepare(
        `INSERT INTO bookings (
           booking_reference, full_name, phone, email, driving_experience, lesson_type,
           preferred_date, preferred_time, contact_preference, message, status
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new')`,
      )
      .run(
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
      )

    return res.status(201).json({
      ok: true,
      message: 'Booking submitted successfully.',
      bookingReference: reference,
      bookingId: Number((result as { lastInsertRowid: number }).lastInsertRowid),
    })
  } catch (error) {
    return res.status(500).json({
      error: 'We could not save your booking right now. Please try again in a moment.',
      details: error instanceof Error ? error.message : 'Unknown database error',
    })
  }
})

app.post('/api/contact', (req, res) => {
  const parsed = contactSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() })
  }

  try {
    db.prepare('INSERT INTO enquiries (name, email, phone, message, status) VALUES (?, ?, ?, ?, ?)').run(
      parsed.data.name,
      parsed.data.email,
      parsed.data.phone,
      parsed.data.message,
      'new',
    )

    return res.status(201).json({ ok: true, message: 'Your enquiry has been received.' })
  } catch (error) {
    return res.status(500).json({
      error: 'Unable to save your enquiry right now. Please try again in a moment.',
      details: error instanceof Error ? error.message : 'Unknown database error',
    })
  }
})

app.post('/api/admin/login', (req, res) => {
  const credentials = z.object({ email: z.string().email(), password: z.string().min(6) }).safeParse(req.body)
  if (!credentials.success) {
    return res.status(400).json({ error: 'Valid email and password are required.' })
  }

  const user = db
    .prepare('SELECT id, email, name, password_hash, role FROM users WHERE email = ?')
    .get(credentials.data.email) as User | undefined

  if (!user || !bcrypt.compareSync(credentials.data.password, user.password_hash)) {
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

app.get('/api/admin/dashboard', requireAuth, (_req, res) => {
  const totals = {
    bookings: Number(db.prepare('SELECT COUNT(*) AS total FROM bookings').get()?.total ?? 0),
    enquiries: Number(db.prepare('SELECT COUNT(*) AS total FROM enquiries').get()?.total ?? 0),
    services: Number(db.prepare('SELECT COUNT(*) AS total FROM services WHERE status = ?').get('published')?.total ?? 0),
    pages: Number(db.prepare('SELECT COUNT(*) AS total FROM pages WHERE status = ?').get('published')?.total ?? 0),
  }

  const recentBookings = db.prepare('SELECT * FROM bookings ORDER BY created_at DESC LIMIT 5').all()
  const recentEnquiries = db.prepare('SELECT * FROM enquiries ORDER BY created_at DESC LIMIT 5').all()

  res.json({
    totals,
    recentBookings,
    recentEnquiries,
  })
})

app.get('/api/admin/bookings', requireAuth, (_req, res) => {
  const bookings = db.prepare('SELECT * FROM bookings ORDER BY created_at DESC').all()
  res.json(bookings)
})

app.get('/api/admin/enquiries', requireAuth, (_req, res) => {
  const enquiries = db.prepare('SELECT * FROM enquiries ORDER BY created_at DESC').all()
  res.json(enquiries)
})

app.patch('/api/admin/bookings/:id/status', requireAuth, (req, res) => {
  const schema = z.object({ status: z.enum(['new', 'contacted', 'confirmed', 'completed']) })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid booking status.' })
  }

  const result = db.prepare('UPDATE bookings SET status = ? WHERE id = ?').run(parsed.data.status, Number(req.params.id))
  if (!result.changes) {
    return res.status(404).json({ error: 'Booking not found.' })
  }

  res.json({ ok: true, status: parsed.data.status })
})

app.patch('/api/admin/enquiries/:id/status', requireAuth, (req, res) => {
  const schema = z.object({ status: z.enum(['new', 'contacted', 'confirmed', 'completed']) })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid enquiry status.' })
  }

  const result = db.prepare('UPDATE enquiries SET status = ? WHERE id = ?').run(parsed.data.status, Number(req.params.id))
  if (!result.changes) {
    return res.status(404).json({ error: 'Enquiry not found.' })
  }

  res.json({ ok: true, status: parsed.data.status })
})

app.get('/api/admin/pages', requireAuth, (_req, res) => {
  const pages = db.prepare('SELECT * FROM pages ORDER BY id ASC').all()
  res.json(pages)
})

app.post('/api/admin/pages', requireAuth, (req, res) => {
  const parsed = pageSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() })
  }

  const page = parsed.data
  const result = db.prepare(
    'INSERT INTO pages (slug, title, description, seo_title, meta_description, status) VALUES (?, ?, ?, ?, ?, ?)',
  ).run(page.slug, page.title, page.description, page.seoTitle ?? page.title, page.metaDescription ?? page.description, 'published')

  const pageId = Number((result as { lastInsertRowid: number }).lastInsertRowid)
  const insertSection = db.prepare('INSERT INTO page_sections (page_id, heading, body, items, sort_order) VALUES (?, ?, ?, ?, ?)')
  page.sections.forEach((section, index) => {
    insertSection.run(pageId, section.heading, section.body, JSON.stringify(section.items ?? []), index)
  })

  res.status(201).json({ ok: true, pageId })
})

app.delete('/api/admin/pages/:slug', requireAuth, (req, res) => {
  const result = db.prepare('DELETE FROM pages WHERE slug = ?').run(req.params.slug)
  if (!result.changes) {
    return res.status(404).json({ error: 'Page not found.' })
  }
  res.json({ ok: true })
})

app.get('/api/admin/services', requireAuth, (_req, res) => {
  const services = db.prepare('SELECT * FROM services ORDER BY id ASC').all()
  res.json(services)
})

app.get('/api/admin/faqs', requireAuth, (_req, res) => {
  const faqs = db.prepare('SELECT * FROM faqs ORDER BY id ASC').all()
  res.json(faqs)
})

app.get('/api/admin/pricing', requireAuth, (_req, res) => {
  const pricing = db.prepare('SELECT * FROM pricing_plans ORDER BY id ASC').all()
  res.json(pricing)
})

app.get('/api/admin/areas', requireAuth, (_req, res) => {
  const areas = db.prepare('SELECT * FROM service_areas ORDER BY id ASC').all()
  res.json(areas)
})

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath))
  app.get(/^(?!\/api).+/, (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'))
  })
} else {
  app.get(/^(?!\/api).+/, (_req, res) => {
    res.status(200).json({ message: 'Frontend build missing. Run npm run build or use Vite dev server.' })
  })
}

app.listen(port, () => {
  console.log(`AWO API listening on http://localhost:${port}`)
})

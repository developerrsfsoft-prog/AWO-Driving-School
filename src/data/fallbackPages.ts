export type PageSection = {
  heading: string
  body: string
  items: string[]
  imageUrl?: string
  imageAlt?: string
}

export type PageContent = {
  slug: string
  title: string
  description: string
  seoTitle: string
  metaDescription: string
  heroImageUrl?: string
  heroImageAlt?: string
  bannerImageUrl?: string
  bannerImageAlt?: string
  sections: PageSection[]
}

export const fallbackPages: PageContent[] = [
  {
    slug: 'about',
    title: 'About Us',
    description: 'AWO Driving School helps learners build confidence, safety and calm driving habits with practical, supportive instruction.',
    seoTitle: 'About AWO Driving School',
    metaDescription: 'Learn how AWO Driving School helps learners feel confident and prepared behind the wheel.',
    sections: [
      {
        heading: 'A calm, supportive approach',
        body: 'We focus on confidence, clarity and safe habits so each lesson feels productive and realistic.',
        items: ['Patient teaching', 'Clear feedback', 'Progressive learning'],
      },
      {
        heading: 'Built around your goals',
        body: 'Whether you are a new learner or returning to driving, the lesson plan can be shaped around your current confidence and objectives.',
        items: ['Beginner support', 'Refresher confidence', 'Test prep focus'],
      },
    ],
  },
  {
    slug: 'driving-lessons',
    title: 'Driving Lessons',
    description: 'Structured, practical driving lessons for beginners, returning drivers and learners preparing for their test — taught at a pace that builds real confidence.',
    seoTitle: 'Driving Lessons | AWO Driving School',
    metaDescription: 'Explore driving lesson options at AWO Driving School, including beginner lessons, flexible pay-as-you-go, intensive learning and test preparation.',
    sections: [
      {
        heading: 'Lessons shaped around you',
        body: 'Every learner starts from a different place. Lessons are planned around your experience, confidence level and goals, so time on the road is focused, calm and productive.',
        items: ['Clear explanations and patient guidance', 'Practice on the skills you need most', 'Steady progress from lesson to lesson'],
      },
      {
        heading: 'Skills for everyday driving',
        body: 'Beyond passing a test, good tuition helps you make safe decisions in real traffic. Sessions can cover observation, planning, vehicle control and the judgement needed for everyday journeys.',
        items: ['Junctions, roundabouts and lane discipline', 'Manoeuvres, parking and independent driving', 'Building confidence on familiar and new routes'],
      },
      {
        heading: 'Not sure which option fits?',
        body: 'If you are unsure whether to choose pay-as-you-go, a faster course or refresher support, get in touch and we can help you find a sensible starting point.',
        items: ['Beginner and nervous-driver friendly', 'Flexible options for different schedules', 'Honest guidance on next steps'],
      },
    ],
  },
  {
    slug: 'beginner-driving-lessons',
    title: 'Beginner Driving Lessons',
    description: 'A calm, step-by-step introduction to driving — from understanding the controls to handling everyday road situations with confidence.',
    seoTitle: 'Beginner Driving Lessons | AWO Driving School',
    metaDescription: 'Beginner driving lessons with AWO Driving School. Learn car controls, road basics, manoeuvres and safe driving habits at a comfortable pace.',
    sections: [
      {
        heading: 'A calm first step onto the road',
        body: 'Starting to drive can feel like a lot at once. Beginner lessons break things down into manageable stages so you can understand the controls, build routine and gain confidence without pressure.',
        items: ['Cockpit drill, controls and moving off safely', 'Steering, gears/clutch control basics and stopping smoothly', 'Meeting traffic, junction routines and safe observations'],
      },
      {
        heading: 'What you’ll practise as you progress',
        body: 'As the basics become familiar, lessons introduce the situations you’ll meet in real driving — with clear guidance and time to practise until each skill feels comfortable.',
        items: ['Roundabouts, crossroads and changing lanes', 'Parking and common manoeuvres', 'Independent driving and planning ahead'],
      },
      {
        heading: 'Support for nervous new drivers',
        body: 'Questions are encouraged and mistakes are treated as part of learning. The aim is steady progress, safe habits and the confidence to handle the road on your own terms.',
        items: ['Patient, confidence-first instruction', 'Lessons paced around your comfort level', 'Clear feedback after each session'],
      },
    ],
  },
  {
    slug: 'pay-as-you-go',
    title: 'Pay As You Go',
    description: 'Flexible driving lessons you can book around your schedule — ideal if you prefer to learn steadily without committing to a fixed block upfront.',
    seoTitle: 'Pay As You Go Driving Lessons | AWO Driving School',
    metaDescription: 'Flexible pay-as-you-go driving lessons from AWO Driving School. Book lessons at a pace that suits your schedule, budget and confidence.',
    sections: [
      {
        heading: 'Flexible learning that fits your life',
        body: 'Pay As You Go is a practical choice if you want control over how often you take lessons. You can build momentum when it suits you and keep learning consistent around work, study or family commitments.',
        items: ['Book lessons at a frequency that works for you', 'No fixed block required to get started', 'A good option for steady, ongoing progress'],
      },
      {
        heading: 'Make every lesson count',
        body: 'Each session can focus on the skills that will make the biggest difference right now — whether that’s clutch control, roundabouts, manoeuvres or building confidence in busier traffic.',
        items: ['Lesson goals agreed at a comfortable pace', 'Practice tailored to your current experience', 'Useful feedback to guide what comes next'],
      },
      {
        heading: 'Who this suits best',
        body: 'This format works well for learners who prefer flexibility, those balancing lessons with other commitments, or anyone who wants to progress step by step with clear next actions after each drive.',
        items: ['New learners building foundations gradually', 'Learners topping up practice between other commitments', 'Drivers who prefer a relaxed, adaptable schedule'],
      },
    ],
  },
  {
    slug: 'intensive-courses',
    title: 'Intensive Courses',
    description: 'A structured block of regular lessons designed to help you build skills and confidence more quickly through consistent, focused practice.',
    seoTitle: 'Intensive Driving Courses | AWO Driving School',
    metaDescription: 'Intensive driving courses at AWO Driving School. Build momentum with structured, regular lessons focused on skill, confidence and safe decision-making.',
    sections: [
      {
        heading: 'Build momentum with regular practice',
        body: 'Intensive courses suit learners who can commit to lessons close together. Regular time on the road helps reinforce skills, reduce gaps between sessions and keep progress moving.',
        items: ['More frequent lessons to strengthen routine', 'Structured focus on key driving competencies', 'Support to turn practice into lasting confidence'],
      },
      {
        heading: 'A focused plan, not a rushed one',
        body: 'Learning quickly still means learning properly. Sessions are planned around your current ability so you can develop safe control, observation and judgement — not just familiarity with routes.',
        items: ['Progression based on your starting point', 'Time spent on the areas that need most work', 'Emphasis on safe, independent decision-making'],
      },
      {
        heading: 'Is an intensive course right for you?',
        body: 'This option can work well if you have time available, want to maintain momentum, or are working towards a specific goal. If you’re unsure, we can discuss whether an intensive or flexible approach suits you better.',
        items: ['Good for learners who prefer regular sessions', 'Helpful when you want clear structure and momentum', 'Advice available to choose the right format'],
      },
    ],
  },
  {
    slug: 'fast-track-courses',
    title: 'Fast Track Courses',
    description: 'A focused learning route for motivated learners who want structured, regular practice to progress efficiently with professional guidance.',
    seoTitle: 'Fast Track Driving Courses | AWO Driving School',
    metaDescription: 'Fast track driving courses from AWO Driving School. Structured lessons, clear goals and regular practice to help motivated learners progress efficiently.',
    sections: [
      {
        heading: 'Progress with purpose',
        body: 'Fast Track courses are designed for learners who want a clear plan and consistent practice. Lessons are organised to keep development moving while maintaining the calm, safety-first approach needed for confident driving.',
        items: ['Goal-led lesson structure', 'Regular practice to maintain momentum', 'Clear priorities for each stage of learning'],
      },
      {
        heading: 'What focused training covers',
        body: 'Depending on your experience, sessions can strengthen core control, improve road awareness and build confidence in more demanding situations — always with practical feedback you can act on.',
        items: ['Vehicle control, observations and anticipation', 'Complex junctions, roundabouts and varied road types', 'Independent driving, planning and self-correction'],
      },
      {
        heading: 'Support that keeps you on track',
        body: 'Efficient progress comes from knowing what to work on next. You’ll get straightforward guidance on strengths, areas to improve and how to get the most from each lesson.',
        items: ['Honest feedback on readiness and progress', 'Lessons adapted as your skills develop', 'A structured route without unnecessary pressure'],
      },
    ],
  },
  {
    slug: 'refresher-lessons',
    title: 'Refresher Lessons',
    description: 'Supportive lessons for qualified drivers or learners returning after a break — rebuild confidence, update skills and feel comfortable on the road again.',
    seoTitle: 'Refresher Driving Lessons | AWO Driving School',
    metaDescription: 'Refresher driving lessons with AWO Driving School. Regain confidence after a break, practise specific skills and feel safer in everyday driving situations.',
    sections: [
      {
        heading: 'Get comfortable behind the wheel again',
        body: 'If you haven’t driven for a while, or you passed your test but don’t feel fully confident, refresher lessons offer a calm way back. Sessions focus on the situations that matter to you, at a pace that feels manageable.',
        items: ['Ideal after a break from driving', 'Support for nervous or low-confidence drivers', 'No judgement — just practical, helpful coaching'],
      },
      {
        heading: 'Focus on the skills you need',
        body: 'Refresher tuition is tailored. You might want to practise motorway or dual-carriageway driving, parking, night driving, busy junctions, or simply rebuild smooth control and observation habits.',
        items: ['Roundabouts, junctions and lane changes', 'Parking and manoeuvres in real settings', 'Driving on faster roads or unfamiliar routes'],
      },
      {
        heading: 'Practical outcomes',
        body: 'The goal is confidence you can rely on in everyday journeys. Each lesson provides clear guidance so you know what’s improving and what to keep practising.',
        items: ['Targeted practice based on your concerns', 'Calm coaching to reduce anxiety', 'Actionable feedback for independent driving'],
      },
    ],
  },
  {
    slug: 'test-preparation',
    title: 'Practical Driving Test Preparation',
    description: 'Focused preparation to help you drive safely, independently and confidently — with practice on the skills and situations examiners expect to see.',
    seoTitle: 'Practical Driving Test Preparation | AWO Driving School',
    metaDescription: 'Practical driving test preparation with AWO Driving School. Build test-ready skills, confidence and safe habits with focused, supportive coaching.',
    sections: [
      {
        heading: 'Prepare with confidence, not guesswork',
        body: 'Test preparation lessons focus on the standard of driving needed for safe, independent journeys. You’ll practise the skills commonly assessed while developing the calm decision-making that helps on test day and beyond.',
        items: ['Independent driving and following directions', 'Manoeuvres, control and accurate observations', 'Meeting traffic, speed choice and positioning'],
      },
      {
        heading: 'Tackle the areas that cost marks',
        body: 'Sessions can target the situations you find most challenging — such as roundabouts, busy junctions, parking or keeping consistent observations — so you know where you stand and what to improve.',
        items: ['Mock-test style practice where helpful', 'Feedback on recurring faults and how to fix them', 'Coaching to stay composed under pressure'],
      },
      {
        heading: 'Ready when you are',
        body: 'Good preparation is about readiness, not rushing. Lessons aim to build safe habits and confidence so that when you take your test, you’re driving to a standard you can maintain every day.',
        items: ['Honest guidance on progress and readiness', 'Emphasis on safety and real-world competence', 'Support to approach the test calmly'],
      },
    ],
  },
  {
    slug: 'areas-we-cover',
    title: 'Areas We Cover',
    description: 'Discuss the local roads and scenarios you want to practise and feel more confident driving through.',
    seoTitle: 'Areas We Cover',
    metaDescription: 'Explore the areas AWO Driving School can help learners practise and build confidence in.',
    sections: [
      {
        heading: 'Local routes and familiar roads',
        body: 'We can help you focus on the roads, junctions and traffic conditions that matter in your day-to-day driving.',
        items: ['Local road confidence', 'Junction support', 'Traffic confidence'],
      },
    ],
  },
  {
    slug: 'faqs',
    title: 'FAQs',
    description: 'The most common questions about lesson planning and building driving confidence with AWO.',
    seoTitle: 'Driving School FAQs',
    metaDescription: 'Read the FAQs for AWO Driving School and learn more about confidence-focused lesson planning.',
    sections: [
      {
        heading: 'Common learner questions',
        body: 'Answers to the most common questions for nervous beginners, returning drivers and learners preparing for their next step.',
        items: ['Nervous beginners welcome', 'Flexible lesson planning', 'Confidence-first coaching'],
      },
    ],
  },
  {
    slug: 'contact',
    title: 'Contact',
    description: 'Use the contact form or phone number to ask about lessons, availability and your next steps.',
    seoTitle: 'Contact AWO Driving School',
    metaDescription: 'Contact AWO Driving School to discuss lesson options and your driving goals.',
    sections: [
      {
        heading: 'Get in touch',
        body: 'We are happy to discuss your goals, current experience and the right lesson structure for you.',
        items: ['Phone contact', 'Email contact', 'Lesson enquiry support'],
      },
    ],
  },
  {
    slug: 'booking',
    title: 'Booking',
    description: 'Submit an enquiry and tell us about your lesson goals, current confidence and preferred timing.',
    seoTitle: 'Book a Lesson | AWO Driving School',
    metaDescription: 'Book a lesson enquiry with AWO Driving School and share your goals, availability and current experience.',
    sections: [
      {
        heading: 'Tell us about your goals',
        body: 'Share the details that will help shape the next lesson and give you the confidence to progress.',
        items: ['Driving experience', 'Preferred lesson type', 'Preferred date and time'],
      },
    ],
  },
  {
    slug: 'privacy-policy',
    title: 'Privacy Policy',
    description: 'How AWO Driving School handles enquiries and personal details responsibly.',
    seoTitle: 'Privacy Policy',
    metaDescription: 'Read the AWO Driving School privacy policy to understand how learner information is handled.',
    sections: [
      {
        heading: 'How information is used',
        body: 'We keep the information shared through enquiries to support communication and lesson planning only.',
        items: ['Contact details', 'Lesson enquiry information', 'Supportive follow-up'],
      },
    ],
  },
  {
    slug: 'cookie-policy',
    title: 'Cookie Policy',
    description: 'Details on the cookies used to support core site functionality and usability.',
    seoTitle: 'Cookie Policy',
    metaDescription: 'Review the AWO Driving School cookie policy and understand how the site uses essential cookies.',
    sections: [
      {
        heading: 'Website cookies',
        body: 'Essential cookies help the website work properly, while keeping the experience as simple and useful as possible.',
        items: ['Essential functionality', 'Usability support', 'Performance awareness'],
      },
    ],
  },
  {
    slug: 'terms-and-conditions',
    title: 'Terms and Conditions',
    description: 'The arrangement terms and responsibilities for learners, enquiries and lesson bookings.',
    seoTitle: 'Terms and Conditions',
    metaDescription: 'Review the AWO Driving School terms and conditions covering lesson arrangements and communication expectations.',
    sections: [
      {
        heading: 'Lesson arrangements',
        body: 'Lesson timing, aims and communication should be discussed directly with AWO Driving School to keep arrangements clear.',
        items: ['Clear scheduling', 'Learner communication', 'Shared expectations'],
      },
    ],
  },
]

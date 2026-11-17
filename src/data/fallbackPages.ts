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
    description: 'Structured, practical lessons for learners of different ages, experience levels and comfort levels.',
    seoTitle: 'Driving Lessons | AWO Driving School',
    metaDescription: 'Discover personalised driving lessons from AWO Driving School with practical support and calm coaching.',
    sections: [
      {
        heading: 'Tailored lessons for real progress',
        body: 'Each lesson can focus on the areas that matter most to you and support your confidence behind the wheel.',
        items: ['Calm coaching', 'Progress tracking', 'Road awareness'],
      },
      {
        heading: 'Confidence first',
        body: 'We build practical ability in a steady, manageable way, so you can improve both skill and comfort.',
        items: ['Nervous learner support', 'Practical road skills', 'Goal-focused coaching'],
      },
    ],
  },
  {
    slug: 'beginner-driving-lessons',
    title: 'Beginner Driving Lessons',
    description: 'A gentle way to understand the car, master the basics and build confidence one step at a time.',
    seoTitle: 'Beginner Driving Lessons | AWO Driving School',
    metaDescription: 'Beginner-friendly driving lessons that help learners understand the car, the road and the fundamentals of safe driving.',
    sections: [
      {
        heading: 'Start gently and build confidence',
        body: 'From the first lesson onwards, the focus is on understanding the controls, road basics and safe habits.',
        items: ['Controls and car familiarisation', 'Basic manoeuvres', 'Safe road habits'],
      },
      {
        heading: 'Your pace, your progress',
        body: 'We take things in steps and leave space to ask questions, practise and relax into the process.',
        items: ['Steady learning', 'Supportive coaching', 'Clear progression'],
      },
    ],
  },
  {
    slug: 'pay-as-you-go',
    title: 'Pay As You Go',
    description: 'Flexible lesson planning for learners who want booking freedom and a pace that suits them.',
    seoTitle: 'Pay As You Go Lessons',
    metaDescription: 'Flexible pay-as-you-go driving lessons to suit your schedule and confidence level.',
    sections: [
      {
        heading: 'Flexible arrangements',
        body: 'This option is ideal when you want to learn at a pace that fits your schedule and your current confidence level.',
        items: ['Flexible bookings', 'Progressive learning', 'Calm confidence building'],
      },
    ],
  },
  {
    slug: 'intensive-courses',
    title: 'Intensive Courses',
    description: 'Structured learning blocks for learners wishing to progress quickly with the right amount of support.',
    seoTitle: 'Intensive Driving Courses',
    metaDescription: 'Explore intensive driving course options that help learners build momentum and confidence faster.',
    sections: [
      {
        heading: 'Focused, consistent progress',
        body: 'Intensive options can help learners work through skills more regularly, keeping momentum steady and useful.',
        items: ['Regular revision', 'Faster progression', 'Structured support'],
      },
    ],
  },
  {
    slug: 'fast-track-courses',
    title: 'Fast Track Courses',
    description: 'A more direct route for learners ready to move forward with focused support and regular practice.',
    seoTitle: 'Fast Track Driving Courses',
    metaDescription: 'Fast track driving lessons for confident learners who want a more direct route to improvement.',
    sections: [
      {
        heading: 'Direct and focused',
        body: 'We help you keep your learning efficient and structured, with attention on progress and confidence.',
        items: ['Targeted practice', 'Clear next steps', 'Confidence-led progression'],
      },
    ],
  },
  {
    slug: 'refresher-lessons',
    title: 'Refresher Lessons',
    description: 'A supportive route back to driving for those who want to rebuild confidence and refresh skills.',
    seoTitle: 'Refresher Lessons | AWO Driving School',
    metaDescription: 'Refresher driving lessons for calm confidence-building and practical road skill refreshment.',
    sections: [
      {
        heading: 'Ease back behind the wheel',
        body: 'Refresher lessons help rebuild confidence and remind you how to handle the fundamentals with clarity.',
        items: ['Road awareness', 'Skill refresh', 'Confidence coaching'],
      },
    ],
  },
  {
    slug: 'test-preparation',
    title: 'Practical Driving Test Preparation',
    description: 'Realistic, confidence-building preparation for the practical driving test.',
    seoTitle: 'Practical Driving Test Preparation',
    metaDescription: 'Prepare for your practical driving test with realistic, confidence-first coaching and structured practise.',
    sections: [
      {
        heading: 'Focused test preparation',
        body: 'We work on the habits and road awareness that matter most in realistic driving situations.',
        items: ['Confidence building', 'Road awareness', 'Calm test prep'],
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

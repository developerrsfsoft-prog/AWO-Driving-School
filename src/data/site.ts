import type { LucideIcon } from 'lucide-react'
import {
  ArrowRight,
  Award,
  CarFront,
  Clock3,
  Mail,
  MessageSquareText,
  PhoneCall,
  ShieldCheck,
  Target,
  ThumbsUp,
  TimerReset,
  WalletCards,
} from 'lucide-react'

export type NavItem = {
  label: string
  href: string
  children?: NavItem[]
}

export type Service = {
  title: string
  description: string
  icon: LucideIcon
}

export type FaqItem = {
  question: string
  answer: string
}

export const navItems: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/about' },
  {
    label: 'Courses',
    href: '/courses',
    children: [
      { label: 'Beginner lessons', href: '/courses/beginner-driving-lessons' },
      { label: 'Pay As You Go', href: '/courses/pay-as-you-go' },
      { label: 'Intensive courses', href: '/courses/intensive-courses' },
      { label: 'Fast-Track Courses', href: '/courses/fast-track-courses' },
      { label: 'Refresher lessons', href: '/courses/refresher-lessons' },
      { label: 'Test preparation', href: '/courses/test-preparation' },
    ],
  },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Contact Us', href: '/contact' },
]

export const learningPrinciples = [
  {
    title: 'Start where you are',
    description: 'Build from your current experience, whether you are brand new or returning to driving.',
  },
  {
    title: 'Learn at your pace',
    description: 'Take the time to practise, ask questions, and get comfortable with each new skill.',
  },
  {
    title: 'Keep moving forward',
    description: 'Use clear, practical feedback to make every lesson a useful next step.',
  },
]

export const services: Service[] = [
  {
    title: 'Pay As You Go',
    description: 'Flexible, straightforward lesson options for learners who want to book as needed.',
    icon: WalletCards,
  },
  {
    title: 'Fast-Track Courses',
    description: 'Focused learning blocks designed to move you forward quickly with structure, practice and support.',
    icon: TimerReset,
  },
  {
    title: 'Beginner lessons',
    description: 'Get to know the car, the controls, and the basics of driving with a step-by-step start.',
    icon: CarFront,
  },
  {
    title: 'Refresher lessons',
    description: 'Return to the road and practise the situations where a little more confidence would help.',
    icon: Award,
  },
  {
    title: 'Test preparation',
    description: 'Review essential skills and practise driving independently as your test gets closer.',
    icon: Target,
  },
  {
    title: 'Pass plus',
    description: 'Continue learning after your test with experience in a broader range of road conditions.',
    icon: ShieldCheck,
  },
]

export const processSteps = [
  {
    title: 'Tell us about your goals',
    detail: 'Share your experience and what you would like to feel more confident doing.',
    icon: MessageSquareText,
  },
  {
    title: 'Discuss lesson options',
    detail: 'Talk through lesson formats, availability and the right place to begin.',
    icon: ShieldCheck,
  },
  {
    title: 'Agree your next step',
    detail: 'Make arrangements directly with AWO, then build your skills one lesson at a time.',
    icon: Clock3,
  },
]

export const practiceAreas = [
  'Starting, stopping, and moving off',
  'Junctions and roundabouts',
  'Residential and busier roads',
  'Dual carriageways',
  'Parking and manoeuvres',
  'Independent driving practice',
]

export const faqs: FaqItem[] = [
  {
    question: 'Do you teach nervous beginners?',
    answer:
      'Yes. Lessons can start with the basics and build up step by step, with time to ask questions and get comfortable.',
  },
  {
    question: 'Can I get in touch before I have my provisional licence?',
    answer:
      'You can get in touch to discuss your plans. You will need the appropriate licence before beginning practical driving lessons.',
  },
  {
    question: 'Can lessons focus on specific skills?',
    answer:
      'Yes. You can talk through the situations you want to practise, such as parking, roundabouts, or getting back behind the wheel.',
  },
  {
    question: 'How do I ask about availability and lesson prices?',
    answer:
      'Use the enquiry form or the contact details on this page to ask about current availability, lesson formats, and pricing.',
  },
]

export const trustBadges = [
  { icon: ShieldCheck, label: 'Focus on safe habits' },
  { icon: ThumbsUp, label: 'Supportive instruction' },
  { icon: WalletCards, label: 'Clear next steps' },
  { icon: Target, label: 'Practice with purpose' },
]

export const differentiators = [
  { icon: WalletCards, title: 'Affordable Prices', description: 'We believe access to quality driving instruction shouldn\'t break the bank. We offer competitive rates and transparent pricing.' },
  { icon: CarFront, title: 'Focus on Practical Skills', description: 'We prioritize real-world driving scenarios over rote memorization. Our instructors will tailor lessons to your needs so you can drive confidently anywhere.' },
  { icon: Clock3, title: 'Flexible scheduling', description: 'We understand your life is busy. That\'s why we offer a variety of lesson times and packages to fit your needs.' },
  { icon: Target, title: 'DMV Test Preparation', description: 'Get focused guidance and practice tests to conquer your driving test with confidence. Pass on your first try!' },
  { icon: ThumbsUp, title: 'Patient Instructors', description: 'Our instructors are calm, encouraging, and dedicated to helping you become a confident driver.' },
  { icon: ShieldCheck, title: 'Modern vehicles', description: 'Practice makes perfect, and we ensure that practice is done in comfortable, well-maintained cars equipped with the latest safety features.' },
]

export const contactHighlights = [
  { icon: PhoneCall, label: '+44 7465 664828' },
  { icon: Mail, label: 'Awodivingschool@gmail.com' },
]

export const heroTraits = [
  'Beginner-friendly lessons',
  'Refresher support',
  'Confidence-first learning',
]

export const primaryCta = { icon: ArrowRight, label: 'Book a lesson' }

export const stats = [
  { value: '0+', label: 'Years Experience' },
  { value: '0+', label: 'Passing Rate' },
  { value: '0', label: 'Expert Instructor' },
]

export const openingHours = 'Mon-Fri: 9am-5pm, Sat: Closed, Sun: 9am-5pm'

export const socialLinks = ['Facebook', 'Instagram', 'Twitter', 'Youtube']
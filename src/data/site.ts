import type { LucideIcon } from 'lucide-react'
import {
  ArrowRight,
  Award,
  CarFront,
  CheckCircle2,
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
  { label: 'Home', href: '/#top' },
  { label: 'About', href: '/#about' },
  { label: 'Lessons', href: '/#services' },
  { label: 'FAQs', href: '/#faq' },
  { label: 'Contact', href: '/#contact' },
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
    title: 'Beginner lessons',
    description: 'Get to know the car, the controls, and the basics of driving with a step-by-step start.',
    icon: CarFront,
  },
  {
    title: 'Refresher lessons',
    description: 'Return to the road and practise the situations where a little more confidence would help.',
    icon: TimerReset,
  },
  {
    title: 'Test preparation',
    description: 'Review essential skills and practise driving independently as your test gets closer.',
    icon: Target,
  },
  {
    title: 'Pass plus',
    description: 'Continue learning after your test with experience in a broader range of road conditions.',
    icon: Award,
  },
]

export const processSteps = [
  {
    title: 'Talk about your goals',
    detail: 'Share your experience and what you would like to feel more confident doing.',
    icon: MessageSquareText,
  },
  {
    title: 'Choose a place to begin',
    detail: 'Start with the skills that are most useful for your current stage of learning.',
    icon: ShieldCheck,
  },
  {
    title: 'Practise with guidance',
    detail: 'Work through real driving situations with supportive, practical feedback.',
    icon: Clock3,
  },
  {
    title: 'Build your confidence',
    detail: 'Keep practising and developing the skills you need for your next step.',
    icon: CheckCircle2,
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

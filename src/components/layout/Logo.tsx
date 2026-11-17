export default function Logo({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="64" height="64" rx="16" fill="#059669" />
      <path d="M18 22.5C18 21.12 19.12 20 20.5 20H31.5V22H20.5C20.224 20 20 20.9 20 21.5V23.5C20 24.05 20.224 24.5 20.5 24.5H31.5V26.5H20.5C19.12 26.5 18 25.38 18 24V22.5Z" fill="#FDE047" />
      <path d="M33 20H42.5C43.88 20 45 21.12 45 22.5V24C45 25.38 43.88 26.5 42.5 26.5H38.5L43 42H40.83L36.74 28.5H35.33L31.24 42H29.07L33.65 26.5H31.5V24.5H32.5C33.33 24.5 34 23.83 34 23V21.5C34 20.672 33.672 20 33 20Z" fill="#FDE047" />
      <circle cx="32" cy="46" r="4" fill="#FDE047" />
    </svg>
  )
}
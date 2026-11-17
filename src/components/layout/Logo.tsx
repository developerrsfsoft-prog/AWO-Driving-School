export default function Logo({ className = '', light = false }: { className?: string; light?: boolean }) {
  const plate = light ? '#f6f1e7' : '#143028'
  const mark = light ? '#143028' : '#f6f1e7'
  const brass = '#c6a15a'

  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="64" height="64" rx="18" fill={plate} />
      <rect x="8" y="8" width="48" height="48" rx="14" stroke={brass} strokeWidth="1.5" />
      <path d="M18 24.5h12.2c1.7 0 2.8 1.1 2.8 2.6v1.2c0 1.5-1.1 2.6-2.8 2.6H22.2L28.8 44h-3.2l-6.2-12.2H18V44h-3.2V24.5H18z" fill={mark} />
      <path d="M36.2 24.5H46c1.8 0 3 1.2 3 2.8v1.4c0 1.6-1.2 2.8-3 2.8h-6.2L46 44h-3.3l-5.8-11.6h-1.6V44H32V24.5h4.2z" fill={brass} />
    </svg>
  )
}

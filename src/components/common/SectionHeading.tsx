type SectionHeadingProps = {
  eyebrow: string
  title: string
  description?: string
  align?: 'left' | 'center'
  tone?: 'dark' | 'light'
}

function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  tone = 'dark',
}: SectionHeadingProps) {
  const alignment = align === 'center' ? 'mx-auto text-center' : 'text-left'
  const colors = tone === 'light'
    ? 'text-white [&>p:last-child]:text-slate-300'
    : 'text-slate-900 [&>p:last-child]:text-slate-600'

  return (
    <div className={`max-w-2xl ${alignment} ${colors}`}>
      <p className={`text-sm font-semibold uppercase tracking-[0.22em] ${tone === 'light' ? 'text-emerald-300' : 'text-emerald-800'}`}>
        {eyebrow}
      </p>
      <h2 className="mt-4 text-3xl font-black tracking-tight md:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-base leading-7 md:text-lg">{description}</p>
      ) : null}
    </div>
  )
}

export default SectionHeading

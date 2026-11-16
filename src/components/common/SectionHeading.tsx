type SectionHeadingProps = {
  eyebrow: string
  title: string
  description?: string
  align?: 'left' | 'center'
}

function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
}: SectionHeadingProps) {
  const alignment = align === 'center' ? 'mx-auto text-center' : 'text-left'

  return (
    <div className={`max-w-2xl ${alignment}`}>
      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-400">
        {eyebrow}
      </p>
      <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-base leading-7 text-slate-600 md:text-lg">{description}</p>
      ) : null}
    </div>
  )
}

export default SectionHeading

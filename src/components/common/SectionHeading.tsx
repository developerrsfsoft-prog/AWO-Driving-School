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
      <p className={`eyebrow ${tone === 'light' ? 'text-[#e8cf8e]' : 'text-[#143028]'}`}>
        {eyebrow}
      </p>
      <h2 className="display mt-4 text-3xl leading-[1.12] md:text-[2.6rem]">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-base leading-7 md:text-lg">{description}</p>
      ) : null}
    </div>
  )
}

export default SectionHeading

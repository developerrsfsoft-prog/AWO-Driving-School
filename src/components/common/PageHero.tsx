import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import Reveal from './Reveal'

type PageHeroProps = {
  eyebrow: string
  title: string
  description?: string
  imageSrc: string
  imageAlt: string
  fallbackSrc: string
  children?: ReactNode
  align?: 'left' | 'center'
  minHeight?: string
}

function PageHero({
  eyebrow,
  title,
  description,
  imageSrc,
  imageAlt,
  fallbackSrc,
  children,
  align = 'left',
  minHeight = 'min-h-[78vh] lg:min-h-[680px]',
}: PageHeroProps) {
  const [scrolled, setScrolled] = useState(false)
  
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const alignment = align === 'center' ? 'mx-auto items-center text-center' : 'items-start text-left'

  return (
    <section className={`relative isolate overflow-hidden bg-[#10211c] text-white ${minHeight}`}>
      <img
        src={imageSrc}
        alt={imageAlt}
        width={1600}
        height={1000}
        fetchPriority="high"
        decoding="async"
        className="hero-kenburns absolute inset-0 -z-20 h-full w-full object-cover"
        onError={(event) => {
          const image = event.currentTarget
          image.onerror = null
          image.src = fallbackSrc
        }}
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#10211c]/92 via-[#10211c]/72 to-[#10211c]/30" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#10211c]/80 via-[#10211c]/15 to-[#10211c]/35" />
      <div className={`mx-auto flex ${minHeight} max-w-7xl flex-col justify-end px-4 pb-14 pt-32 sm:px-6 lg:px-8 lg:pb-16 ${alignment}`}>
        <Reveal className="max-w-3xl">
          <p className={`eyebrow transition-colors duration-300 ${scrolled ? 'text-[#143028]' : 'text-[#e8cf8e]'}`}>{eyebrow}</p>
          <h1 className={`display mt-4 max-w-3xl text-[2.35rem] leading-[1.04] sm:text-5xl lg:text-[4.1rem] transition-colors duration-300 ${scrolled ? 'text-[#10211c]' : 'text-white'}`}>{title}</h1>
          {description ? (
            <p className={`mt-5 max-w-2xl text-base leading-7 sm:text-lg transition-colors duration-300 ${scrolled ? 'text-[#3d362f]' : 'text-white/80'} ${align === 'center' ? 'mx-auto' : ''}`}>{description}</p>
          ) : null}
          {children}
        </Reveal>
      </div>
    </section>
  )
}

export default PageHero

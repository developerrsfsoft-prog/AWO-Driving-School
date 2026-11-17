import { animate, motion, useInView, useMotionValue, useReducedMotion, useTransform } from 'motion/react'
import { useEffect, useRef } from 'react'

function AnimatedCounter({ value, label, prefix = '', suffix = '' }: {
  value: number
  label: string
  prefix?: string
  suffix?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.6 })
  const reduceMotion = useReducedMotion()
  const count = useMotionValue(0)
  const rounded = useTransform(count, (current) => Math.round(current).toLocaleString())

  useEffect(() => {
    if (!isInView) {
      return
    }
    if (reduceMotion) {
      count.set(value)
      return
    }
    const controls = animate(count, value, { duration: 1.5, ease: 'easeOut' })
    return () => controls.stop()
  }, [count, isInView, reduceMotion, value])

  return (
    <div ref={ref} className="rounded-[1.6rem] border border-white/10 bg-white/[0.06] px-5 py-7 text-center backdrop-blur">
      <p className="display text-4xl text-white sm:text-5xl">
        {prefix}<motion.span>{rounded}</motion.span>{suffix}
      </p>
      <p className="mt-3 text-sm font-medium text-[#e8cf8e]">{label}</p>
    </div>
  )
}

export default AnimatedCounter

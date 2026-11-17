import { motion, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'

function Reveal({ children, className = '', delay = 0, id }: {
  children: ReactNode
  className?: string
  delay?: number
  id?: string
}) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      id={id}
      initial={reduceMotion ? false : { opacity: 0, y: 20 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.16 }}
      transition={{ duration: 0.5, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export default Reveal

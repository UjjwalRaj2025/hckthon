import { clsx } from 'clsx'
import { motion } from 'framer-motion'

export const Card = ({
  children,
  className = '',
  glow = false,
  glowColor = 'orange',
  hover = false,
  padding = true,
  animate = true,
  ...props
}) => {
  const glowStyles = {
    orange: 'shadow-orange-500/20 hover:shadow-orange-500/30',
    blue:   'shadow-blue-500/20 hover:shadow-blue-500/30',
    green:  'shadow-emerald-500/20 hover:shadow-emerald-500/30',
    red:    'shadow-red-500/20 hover:shadow-red-500/30',
  }

  const Wrapper = animate ? motion.div : 'div'
  const animateProps = animate ? { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3 } } : {}

  return (
    <Wrapper
      className={clsx(
        'rounded-2xl border border-slate-200/80 bg-white shadow-sm',
        padding && 'p-6',
        glow && ['shadow-xl', glowStyles[glowColor]],
        hover && 'transition-all duration-200 hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5',
        className
      )}
      {...animateProps}
      {...props}
    >
      {children}
    </Wrapper>
  )
}

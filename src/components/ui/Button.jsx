import { clsx } from 'clsx'
import { motion } from 'framer-motion'

const variants = {
  primary:   'bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/20 font-bold',
  secondary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 font-bold',
  outline:   'border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 shadow-xs font-semibold',
  ghost:     'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-semibold',
  danger:    'bg-red-500 hover:bg-red-600 text-white shadow-xs font-semibold',
  success:   'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs font-semibold',
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-4 py-2 text-sm rounded-xl',
  lg: 'px-6 py-3 text-base rounded-xl',
  xl: 'px-8 py-4 text-lg rounded-2xl',
}

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  onClick,
  type = 'button',
  ...props
}) => (
  <motion.button
    type={type}
    whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
    whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
    onClick={onClick}
    disabled={disabled || loading}
    className={clsx(
      'relative inline-flex items-center justify-center gap-2 select-none transition-all duration-200 cursor-pointer',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2',
      variants[variant],
      sizes[size],
      className
    )}
    {...props}
  >
    {loading && (
      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    )}
    {children}
  </motion.button>
)

import { clsx } from 'clsx'
import { forwardRef } from 'react'

export const Input = forwardRef(({
  label,
  error,
  hint,
  className = '',
  containerClass = '',
  icon: Icon,
  ...props
}, ref) => (
  <div className={clsx('flex flex-col gap-1.5', containerClass)}>
    {label && (
      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
        {label}
      </label>
    )}
    <div className="relative">
      {Icon && (
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          <Icon size={16} />
        </div>
      )}
      <input
        ref={ref}
        className={clsx(
          'w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-slate-900 font-medium',
          'placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all duration-200 shadow-xs',
          error
            ? 'border-red-400 focus:ring-red-400/30'
            : 'border-slate-300 focus:border-orange-500 focus:ring-orange-500/20',
          Icon && 'pl-10',
          className
        )}
        {...props}
      />
    </div>
    {hint  && !error && <p className="text-xs text-slate-500">{hint}</p>}
    {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
  </div>
))

Input.displayName = 'Input'

export const Textarea = forwardRef(({
  label,
  error,
  className = '',
  containerClass = '',
  ...props
}, ref) => (
  <div className={clsx('flex flex-col gap-1.5', containerClass)}>
    {label && (
      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">{label}</label>
    )}
    <textarea
      ref={ref}
      rows={4}
      className={clsx(
        'w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-slate-900 font-medium',
        'placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all duration-200 resize-none shadow-xs',
        error
          ? 'border-red-400 focus:ring-red-400/30'
          : 'border-slate-300 focus:border-orange-500 focus:ring-orange-500/20',
        className
      )}
      {...props}
    />
    {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
  </div>
))

Textarea.displayName = 'Textarea'

export const Select = forwardRef(({
  label,
  error,
  children,
  className = '',
  containerClass = '',
  ...props
}, ref) => (
  <div className={clsx('flex flex-col gap-1.5', containerClass)}>
    {label && (
      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">{label}</label>
    )}
    <select
      ref={ref}
      className={clsx(
        'w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-slate-900 font-medium shadow-xs',
        'focus:outline-none focus:ring-2 transition-all duration-200 cursor-pointer',
        error
          ? 'border-red-400 focus:ring-red-400/30'
          : 'border-slate-300 focus:border-orange-500 focus:ring-orange-500/20',
        className
      )}
      {...props}
    >
      {children}
    </select>
    {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
  </div>
))

Select.displayName = 'Select'

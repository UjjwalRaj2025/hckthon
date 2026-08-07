import { clsx } from 'clsx'

export const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-10 w-10', xl: 'h-14 w-14' }
  return (
    <svg
      className={clsx('animate-spin text-red-500', sizes[size], className)}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

export const Skeleton = ({ className = '' }) => (
  <div
    className={clsx(
      'rounded-lg bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 animate-pulse',
      className
    )}
  />
)

export const SkeletonCard = () => (
  <div className="rounded-2xl border border-white/[0.07] bg-slate-900/70 p-6 space-y-4">
    <div className="flex items-center gap-3">
      <Skeleton className="h-10 w-10 rounded-xl" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-2 w-1/2" />
      </div>
      <Skeleton className="h-6 w-16 rounded-full" />
    </div>
    <Skeleton className="h-2 w-full" />
    <Skeleton className="h-2 w-4/5" />
    <div className="flex gap-2">
      <Skeleton className="h-8 w-24 rounded-lg" />
      <Skeleton className="h-8 w-24 rounded-lg" />
    </div>
  </div>
)

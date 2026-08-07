import { clsx } from 'clsx'

const styles = {
  Critical: 'bg-red-500/15 text-red-400 border border-red-500/30',
  High:     'bg-orange-500/15 text-orange-400 border border-orange-500/30',
  Medium:   'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30',
  Low:      'bg-green-500/15 text-green-400 border border-green-500/30',
  pending:  'bg-slate-500/15 text-slate-400 border border-slate-500/30',
  assigned: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
  in_progress: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30',
  resolved: 'bg-green-500/15 text-green-400 border border-green-500/30',
  default:  'bg-white/5 text-slate-400 border border-white/10',
}

const dots = {
  Critical:    '🔴',
  High:        '🟠',
  Medium:      '🟡',
  Low:         '🟢',
  pending:     '⚪',
  assigned:    '🔵',
  in_progress: '🟡',
  resolved:    '🟢',
}

const labels = {
  pending:     'Pending',
  assigned:    'Assigned',
  in_progress: 'In Progress',
  resolved:    'Resolved',
}

export const Badge = ({ value, className = '', showDot = true }) => {
  const style = styles[value] || styles.default
  const dot   = dots[value]
  const label = labels[value] || value

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium',
        style,
        className
      )}
    >
      {showDot && dot && <span>{dot}</span>}
      {label}
    </span>
  )
}

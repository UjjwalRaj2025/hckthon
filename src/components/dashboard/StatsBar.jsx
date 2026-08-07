import { motion } from 'framer-motion'
import { AlertTriangle, Activity, CheckCircle, Flame } from 'lucide-react'
import { computeStats } from '../../utils/helpers'

const stat = (icon, label, value, color, delay) => ({ icon, label, value, color, delay })

export const StatsBar = ({ incidents }) => {
  const s = computeStats(incidents)

  const stats = [
    stat(AlertTriangle, 'Total Emergencies', s.total,    'text-blue-400',   0   ),
    stat(Activity,      'Active Operations', s.active,   'text-yellow-400', 0.05),
    stat(CheckCircle,   'Resolved Cases',    s.resolved, 'text-green-400',  0.1 ),
    stat(Flame,         'Critical Alerts',   s.critical, 'text-red-400',    0.15),
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map(({ icon: Icon, label, value, color, delay }, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0  }}
          transition={{ delay, duration: 0.4 }}
          className="rounded-2xl border border-white/[0.07] bg-slate-900/70 backdrop-blur-xl p-5 hover:border-white/10 transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`h-9 w-9 rounded-xl bg-white/5 flex items-center justify-center`}>
              <Icon size={18} className={color} />
            </div>
            {i === 3 && s.critical > 0 && (
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            )}
          </div>
          <p className={`text-3xl font-bold ${color} tabular-nums`}>
            <AnimatedNumber value={value} />
          </p>
          <p className="text-xs text-slate-500 mt-1 font-medium">{label}</p>
        </motion.div>
      ))}
    </div>
  )
}

const AnimatedNumber = ({ value }) => {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {value}
    </motion.span>
  )
}

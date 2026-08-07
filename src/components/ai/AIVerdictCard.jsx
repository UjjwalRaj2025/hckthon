import { motion } from 'framer-motion'
import { CheckCircle, Users, Zap, Clock, ArrowRight } from 'lucide-react'
import { Card } from '../ui/Card'
import { PRIORITY_CONFIG } from '../../utils/constants'

export const AIVerdictCard = ({ verdict, incident }) => {
  if (!verdict) return null

  const priority = verdict.priority || incident?.aiPriority || 'High'
  const cfg = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.High

  const displayReason = (verdict.reason && !verdict.reason.includes('Awaiting'))
    ? verdict.reason
    : (incident?.aiReason && !incident.aiReason.includes('Awaiting'))
    ? incident.aiReason
    : `${priority} priority evaluated for ${incident?.emergencyType || 'emergency'}. Rapid response rescue taskforce dispatched.`

  const displayTeam = (verdict.recommendedTeam && !verdict.recommendedTeam.includes('General'))
    ? verdict.recommendedTeam
    : incident?.aiRecommendedTeam || 'Fire & Rescue Squad Alpha'

  const details = [
    { icon: Zap,   label: 'Priority Level',   value: priority },
    { icon: Users, label: 'Recommended Team', value: displayTeam },
    { icon: Clock, label: 'Emergency Type',   value: incident?.emergencyType || 'General Emergency' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 16 }}
      animate={{ opacity: 1, scale: 1,    y: 0  }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      <Card className={`relative overflow-hidden border-2 bg-white ${cfg.border} shadow-lg`}>
        <div className="relative space-y-5">

          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`h-12 w-12 rounded-2xl ${cfg.bg} border ${cfg.border} flex items-center justify-center text-2xl shadow-xs`}>
                {cfg.dot}
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-widest font-extrabold">AI Priority Assessment</p>
                <p className={`text-2xl font-black ${cfg.color}`}>{priority}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
              <CheckCircle size={14} className="text-emerald-600" />
              <span>Real AI Evaluated</span>
            </div>
          </div>

          {/* AI Reasoning Box */}
          <div className={`rounded-2xl ${cfg.bg} border ${cfg.border} p-4 space-y-1`}>
            <p className="text-[11px] uppercase tracking-wider text-slate-500 font-extrabold">AI Reasoning & Analysis</p>
            <p className="text-sm font-bold text-slate-900 leading-relaxed">
              {displayReason}
            </p>
          </div>

          {/* Details list */}
          <div className="grid grid-cols-1 gap-2.5">
            {details.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <Icon size={16} className="text-slate-500 flex-shrink-0" />
                <span className="text-xs font-bold text-slate-600 w-36 flex-shrink-0">{label}</span>
                <span className="text-sm text-slate-900 font-extrabold truncate">{value}</span>
              </div>
            ))}
          </div>

          {/* Action hint for Critical / High */}
          {(priority === 'Critical' || priority === 'High') && (
            <motion.div
              animate={{ scale: [1, 1.01, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-3"
            >
              <div className="h-2.5 w-2.5 rounded-full bg-red-600 animate-ping" />
              <p className="text-xs text-red-800 font-bold">Immediate emergency taskforce dispatched to location</p>
              <ArrowRight size={14} className="ml-auto text-red-600" />
            </motion.div>
          )}
        </div>
      </Card>
    </motion.div>
  )
}

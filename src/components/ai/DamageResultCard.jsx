import { motion } from 'framer-motion'
import { AlertTriangle, Clock, MapPin, CheckCircle, Zap } from 'lucide-react'
import { Card } from '../ui/Card'
import { PRIORITY_CONFIG } from '../../utils/constants'

export const DamageResultCard = ({ result }) => {
  if (!result) return null

  const cfg = PRIORITY_CONFIG[result.severity] || PRIORITY_CONFIG.Medium

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0  }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="space-y-4"
    >
      {/* Main result */}
      <Card className={`relative overflow-hidden border-2 bg-white ${cfg.border} shadow-md`}>
        <div className="relative space-y-4">
          {/* Damage type + severity */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] text-slate-500 uppercase tracking-wider font-extrabold mb-0.5">Damage Type Detected</p>
              <h3 className="text-xl font-extrabold text-slate-900">{result.damageType}</h3>
            </div>
            <div className={`h-14 w-16 rounded-2xl ${cfg.bg} border ${cfg.border} flex flex-col items-center justify-center shadow-xs`}>
              <span className="text-[10px] text-slate-500 font-extrabold uppercase">Severity</span>
              <span className={`text-sm font-black ${cfg.color}`}>{result.severity}</span>
            </div>
          </div>

          {/* Affected area */}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <MapPin size={15} className="text-orange-500 flex-shrink-0" />
            <span>{result.affectedArea}</span>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Users size={13} className="text-slate-500" />
                <span className="text-xs font-bold text-slate-500">Est. Affected</span>
              </div>
              <p className="text-sm font-extrabold text-slate-900">{result.estimatedAffected}</p>
            </div>
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Clock size={13} className="text-slate-500" />
                <span className="text-xs font-bold text-slate-500">Urgency</span>
              </div>
              <p className={`text-sm font-extrabold ${cfg.color}`}>{result.urgency}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Risks */}
      <Card className="bg-white border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle size={16} className="text-orange-500" />
          <h4 className="text-sm font-extrabold text-slate-900">Possible Hazards & Risks</h4>
        </div>
        <ul className="space-y-2">
          {result.possibleRisks?.map((risk, i) => (
            <li key={i} className="flex items-center gap-2.5 text-xs font-semibold text-slate-700">
              <div className="h-1.5 w-1.5 rounded-full bg-orange-500 flex-shrink-0" />
              {risk}
            </li>
          ))}
        </ul>
      </Card>

      {/* Recommended Actions */}
      <Card className="bg-white border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Zap size={16} className="text-emerald-600" />
          <h4 className="text-sm font-extrabold text-slate-900">Recommended Rescue Actions</h4>
        </div>
        <ul className="space-y-2">
          {result.recommendedActions?.map((action, i) => (
            <li key={i} className="flex items-start gap-2.5 text-xs font-semibold text-slate-700">
              <CheckCircle size={15} className="text-emerald-600 mt-0.5 flex-shrink-0" />
              {action}
            </li>
          ))}
        </ul>
      </Card>
    </motion.div>
  )
}

const Users = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)

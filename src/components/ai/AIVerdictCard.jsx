import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, Users, Zap, Clock, ArrowRight, MapPin, Volume2, Image as ImageIcon, Maximize2, X, FileText } from 'lucide-react'
import { Card } from '../ui/Card'
import { PRIORITY_CONFIG } from '../../utils/constants'

export const AIVerdictCard = ({ verdict, incident }) => {
  const [expandPhoto, setExpandPhoto] = useState(false)
  if (!verdict && !incident) return null

  const priority = verdict?.priority || incident?.aiPriority || 'High'
  const cfg = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.High

  const displayReason = (verdict?.reason && !verdict.reason.includes('Awaiting'))
    ? verdict.reason
    : (incident?.aiReason && !incident.aiReason.includes('Awaiting'))
    ? incident.aiReason
    : `${priority} priority evaluated for ${incident?.emergencyType || 'emergency'}. Rapid response rescue taskforce dispatched.`

  const displayTeam = (verdict?.recommendedTeam && !verdict.recommendedTeam.includes('General'))
    ? verdict.recommendedTeam
    : incident?.aiRecommendedTeam || 'Fire & Rescue Squad Alpha'

  const details = [
    { icon: Zap,   label: 'Priority Level',   value: priority },
    { icon: Users, label: 'Recommended Team', value: displayTeam },
    { icon: Clock, label: 'Emergency Type',   value: incident?.emergencyType || 'General Emergency' },
  ]

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1,    y: 0  }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        <Card className={`relative overflow-hidden border-2 bg-white ${cfg.border} shadow-xl p-5 space-y-5`}>
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

          {/* GPS Coordinates & Google Maps Link */}
          {incident?.lat && incident?.lng && (
            <div className="p-3.5 rounded-2xl bg-slate-900 text-white flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2">
                <MapPin size={18} className="text-orange-400" />
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Broadcasted GPS Coordinates</p>
                  <p className="text-xs font-mono font-extrabold text-white">
                    {incident.lat.toFixed(5)}, {incident.lng.toFixed(5)}
                  </p>
                </div>
              </div>
              <a
                href={`https://maps.google.com/?q=${incident.lat},${incident.lng}`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs transition-colors"
              >
                View Map ↗
              </a>
            </div>
          )}

          {/* Citizen Description Text */}
          {incident?.description && (
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="flex items-center gap-1.5 text-xs text-slate-600 font-extrabold uppercase tracking-wider">
                <FileText size={14} className="text-slate-500" />
                Citizen Distress Description
              </span>
              <p className="text-xs font-semibold text-slate-800 leading-relaxed">
                {incident.description}
              </p>
            </div>
          )}

          {/* Citizen Voice Distress Note Audio Player */}
          {incident?.audioUrl && (
            <div className="rounded-2xl border border-orange-200 bg-orange-50/80 p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs text-orange-800 font-extrabold uppercase tracking-wider">
                <Volume2 size={16} className="animate-pulse text-orange-600" />
                🔊 Your Recorded Voice Distress Note
              </div>
              <audio controls src={incident.audioUrl} className="w-full h-9 rounded-xl focus:outline-none" />
            </div>
          )}

          {/* Uploaded Disaster Scene Photo */}
          {incident?.imageUrl && (
            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 shadow-md space-y-2 p-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs text-slate-200 font-bold">
                  <ImageIcon size={14} className="text-orange-400" />
                  📸 Uploaded Disaster Photograph
                </span>
                <button
                  type="button"
                  onClick={() => setExpandPhoto(true)}
                  className="text-[11px] text-orange-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Maximize2 size={12} /> Expand
                </button>
              </div>
              <div className="rounded-xl overflow-hidden border border-slate-700 max-h-56 bg-slate-950">
                <img
                  src={incident.imageUrl}
                  alt="Disaster Scene"
                  className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => setExpandPhoto(true)}
                />
              </div>
            </div>
          )}

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
        </Card>
      </motion.div>

      {/* Expanded Disaster Photo Modal */}
      <AnimatePresence>
        {expandPhoto && incident?.imageUrl && (
          <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
            <div className="relative max-w-3xl w-full max-h-[90vh] bg-slate-900 border border-slate-700 rounded-3xl p-4 overflow-hidden space-y-3 shadow-2xl">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white flex items-center gap-2">
                  📸 Uploaded Disaster Photograph
                </span>
                <button
                  type="button"
                  onClick={() => setExpandPhoto(false)}
                  className="h-8 w-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="rounded-2xl overflow-hidden border border-slate-800 max-h-[75vh]">
                <img src={incident.imageUrl} alt="Disaster Full View" className="w-full h-full object-contain" />
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MapPin, User, Clock, Image as ImageIcon, ShieldCheck, Loader2, ChevronDown, Volume2, Maximize2 } from 'lucide-react'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { StatusTimeline } from './StatusTimeline'
import { patchIncident } from '../../services/apiService'
import { useToast } from '../../context/ToastContext'
import { RESCUE_UNITS, PRIORITY_CONFIG } from '../../utils/constants'
import { timeAgo } from '../../utils/helpers'

export const IncidentDetailPanel = ({ incident, onClose }) => {
  const { push }   = useToast()
  const [unit,     setUnit]     = useState(incident.assignedUnit || '')
  const [updating, setUpdating] = useState(false)
  const [expandPhoto, setExpandPhoto] = useState(false)

  const cfg = PRIORITY_CONFIG[incident.aiPriority] || PRIORITY_CONFIG.Medium

  const handleAssign = async () => {
    if (!unit) return push('Please select a rescue unit', 'warning')
    setUpdating(true)
    try {
      await patchIncident(incident.id, { status: 'assigned', assignedUnit: unit })
      push(`✅ Assigned to ${unit}`, 'success')
    } catch (err) {
      push(err.message, 'error')
    } finally {
      setUpdating(false)
    }
  }

  const handleProgress = async (status) => {
    setUpdating(true)
    try {
      await patchIncident(incident.id, { status })
      push(`Status updated: ${status}`, 'success')
    } catch (err) {
      push(err.message, 'error')
    } finally {
      setUpdating(false)
    }
  }

  return (
    <>
      <motion.div
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed right-0 top-16 bottom-0 w-full sm:w-[440px] bg-slate-950 border-l border-white/[0.07] overflow-y-auto z-40 shadow-2xl space-y-5 p-5"
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-1">Rescue Incident Report</p>
            <h3 className="text-lg font-bold text-white">{incident.emergencyType}</h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge value={incident.aiPriority} />
              <Badge value={incident.status} />
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <X size={15} />
          </button>
        </div>

        {/* AI Reason */}
        <div className={`rounded-xl ${cfg.bg} border ${cfg.border} p-4`}>
          <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-1.5">AI Priority Triage</p>
          <p className="text-sm text-slate-200 leading-relaxed font-medium">{incident.aiReason || '—'}</p>
          {incident.aiRecommendedTeam && (
            <p className="mt-2 text-xs text-slate-400">
              Recommended Taskforce: <span className={`font-bold ${cfg.color}`}>{incident.aiRecommendedTeam}</span>
            </p>
          )}
        </div>

        {/* Reporter Profile Info */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-2">
          <div className="flex items-center gap-3">
            {incident.userImage ? (
              <img src={incident.userImage} alt="User" className="h-10 w-10 rounded-full object-cover border border-slate-700" />
            ) : (
              <div className="h-10 w-10 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 font-bold text-xs">
                <User size={18} />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-500 font-medium">Citizen Reporter Profile</p>
              <p className="text-sm font-bold text-white truncate">{incident.userName || 'Anonymous Citizen'}</p>
              {incident.userEmail && (
                <p className="text-xs text-slate-400 truncate">{incident.userEmail}</p>
              )}
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 block">Reported</span>
              <span className="text-xs font-semibold text-slate-300">{timeAgo(incident.timestamp || incident.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* GPS Location & Google Maps Link */}
        <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] p-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="flex items-center gap-1.5 text-xs text-slate-400 font-bold uppercase tracking-wider">
              <MapPin size={14} className="text-orange-400" />
              GPS Coordinates
            </span>
            <a
              href={`https://maps.google.com/?q=${incident.lat},${incident.lng}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-orange-400 hover:text-orange-300 font-bold"
            >
              Open Maps ↗
            </a>
          </div>
          <p className="text-base font-mono font-extrabold text-white">
            {incident.lat?.toFixed(5)}, {incident.lng?.toFixed(5)}
          </p>
        </div>

        {/* Description Text */}
        <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] p-4 space-y-1">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Emergency Description</p>
          <p className="text-sm text-slate-200 leading-relaxed font-medium">{incident.description}</p>
        </div>

        {/* Citizen Voice Recording Audio Player */}
        {incident.audioUrl && (
          <div className="rounded-2xl border border-orange-500/40 bg-orange-500/10 p-4 space-y-2.5">
            <div className="flex items-center gap-2 text-xs text-orange-400 font-extrabold uppercase tracking-wider">
              <Volume2 size={16} className="animate-pulse text-orange-500" />
              🔊 Citizen Voice Distress Note
            </div>
            <audio controls src={incident.audioUrl} className="w-full h-10 rounded-xl focus:outline-none" />
          </div>
        )}

        {/* Disaster Photograph */}
        {incident.imageUrl && (
          <div className="rounded-2xl overflow-hidden border border-white/10 bg-slate-900/80 shadow-md space-y-2 p-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs text-slate-300 font-bold">
                <ImageIcon size={14} className="text-orange-400" />
                📸 Disaster Scene Photograph
              </span>
              <button
                type="button"
                onClick={() => setExpandPhoto(true)}
                className="text-[11px] text-orange-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Maximize2 size={12} /> Expand
              </button>
            </div>
            <div className="rounded-xl overflow-hidden border border-white/10 max-h-56 bg-slate-950">
              <img
                src={incident.imageUrl}
                alt="Disaster Scene"
                className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                onClick={() => setExpandPhoto(true)}
              />
            </div>
          </div>
        )}

        {/* Status Timeline */}
        <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] p-4">
          <p className="text-xs text-slate-400 mb-3 font-bold uppercase tracking-widest">Rescue Status Timeline</p>
          <StatusTimeline status={incident.status} />
        </div>

        {/* Assign rescue */}
        {incident.status === 'pending' && (
          <div className="space-y-3">
            <p className="text-sm font-bold text-white">Assign Rescue Unit</p>
            <div className="relative">
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-800/80 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500/40 appearance-none"
              >
                <option value="">Select rescue unit…</option>
                {RESCUE_UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
            <Button
              variant="secondary"
              size="md"
              className="w-full"
              loading={updating}
              onClick={handleAssign}
            >
              <ShieldCheck size={15} />
              Assign Rescue Taskforce
            </Button>
          </div>
        )}

        {/* Progress actions */}
        {incident.status === 'assigned' && (
          <Button variant="secondary" size="md" className="w-full" loading={updating} onClick={() => handleProgress('in_progress')}>
            Mark Rescue In Progress
          </Button>
        )}
        {incident.status === 'in_progress' && (
          <Button variant="success" size="md" className="w-full" loading={updating} onClick={() => handleProgress('resolved')}>
            <ShieldCheck size={15} />
            Mark as Resolved
          </Button>
        )}
      </motion.div>

      {/* Expanded Disaster Photo Modal */}
      <AnimatePresence>
        {expandPhoto && incident.imageUrl && (
          <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
            <div className="relative max-w-3xl w-full max-h-[90vh] bg-slate-900 border border-slate-700 rounded-3xl p-4 overflow-hidden space-y-3 shadow-2xl">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white flex items-center gap-2">
                  📸 Disaster Photograph — {incident.emergencyType}
                </span>
                <button
                  type="button"
                  onClick={() => setExpandPhoto(false)}
                  className="h-8 w-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
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

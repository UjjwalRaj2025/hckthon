import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MapPin, User, Clock, Image as ImageIcon, ShieldCheck, Loader2, ChevronDown } from 'lucide-react'
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
    <motion.div
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed right-0 top-16 bottom-0 w-full sm:w-[420px] bg-slate-950 border-l border-white/[0.07] overflow-y-auto z-40 shadow-2xl"
    >
      <div className="p-5 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-1">Incident Report</p>
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
          <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-1.5">AI Assessment</p>
          <p className="text-sm text-slate-200 leading-relaxed">{incident.aiReason || '—'}</p>
          {incident.aiRecommendedTeam && (
            <p className="mt-2 text-xs text-slate-500">
              Recommended: <span className={`font-semibold ${cfg.color}`}>{incident.aiRecommendedTeam}</span>
            </p>
          )}
        </div>

        {/* Citizen / Reporter Info */}
        <div className="rounded-xl bg-slate-900 border border-slate-800 p-3.5 space-y-2">
          <div className="flex items-center gap-3">
            {incident.userImage ? (
              <img src={incident.userImage} alt="User" className="h-9 w-9 rounded-full object-cover border border-slate-700" />
            ) : (
              <div className="h-9 w-9 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 font-bold text-xs">
                <User size={16} />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-500 font-medium">Clerk Reporter Profile</p>
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

        {/* Location */}
        <div className="rounded-xl bg-white/[0.03] border border-white/[0.05] p-3">
          <div className="flex items-center gap-1.5 mb-1.5">
            <MapPin size={12} className="text-slate-500" />
            <span className="text-xs text-slate-500">GPS Coordinates</span>
          </div>
          <p className="text-sm font-mono text-slate-300">
            {incident.lat?.toFixed(6)}, {incident.lng?.toFixed(6)}
          </p>
          <a
            href={`https://maps.google.com/?q=${incident.lat},${incident.lng}`}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-blue-400 hover:text-blue-300 mt-1 inline-block"
          >
            Open in Google Maps →
          </a>
        </div>

        {/* Description */}
        <div className="rounded-xl bg-white/[0.03] border border-white/[0.05] p-3">
          <p className="text-xs text-slate-500 mb-1.5 font-medium">Description</p>
          <p className="text-sm text-slate-300 leading-relaxed">{incident.description}</p>
        </div>

        {/* Image */}
        {incident.imageUrl && (
          <div className="rounded-xl overflow-hidden border border-white/[0.07]">
            <div className="flex items-center gap-1.5 px-3 py-2 bg-white/[0.03] border-b border-white/[0.05]">
              <ImageIcon size={12} className="text-slate-500" />
              <span className="text-xs text-slate-500">Disaster Photo</span>
            </div>
            <img
              src={incident.imageUrl}
              alt="Disaster"
              className="w-full object-cover max-h-52"
            />
          </div>
        )}

        {/* Status Timeline */}
        <div className="rounded-xl bg-white/[0.03] border border-white/[0.05] p-4">
          <p className="text-xs text-slate-500 mb-3 font-medium uppercase tracking-widest">Status Timeline</p>
          <StatusTimeline status={incident.status} />
        </div>

        {/* Assign rescue */}
        {incident.status === 'pending' && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-slate-300">Assign Rescue Unit</p>
            <div className="relative">
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-800/50 px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 appearance-none"
              >
                <option value="">Select rescue unit…</option>
                {RESCUE_UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            </div>
            <Button
              variant="secondary"
              size="md"
              className="w-full"
              loading={updating}
              onClick={handleAssign}
            >
              <ShieldCheck size={15} />
              Assign Rescue
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
      </div>
    </motion.div>
  )
}

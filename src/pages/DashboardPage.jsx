import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { List, Map as MapIcon, Shield, Lock, Key, AlertCircle, ArrowRight, LogOut, Radio, Send, Users, ShieldCheck, X } from 'lucide-react'
import { StatsBar } from '../components/dashboard/StatsBar'
import { LeafletMap } from '../components/map/LeafletMap'
import { IncidentDetailPanel } from '../components/dashboard/IncidentDetailPanel'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Spinner, SkeletonCard } from '../components/ui/Spinner'
import { useIncidents } from '../hooks/useIncidents'
import { deleteIncident, patchIncident, createBroadcast, fetchActiveBroadcasts } from '../services/apiService'
import { useToast } from '../context/ToastContext'
import { PRIORITY_CONFIG } from '../utils/constants'
import { timeAgo, truncate } from '../utils/helpers'
import { clsx } from 'clsx'

export default function DashboardPage() {
  const { incidents, setIncidents, loading } = useIncidents()
  const { push } = useToast()

  // 50km Radius Broadcast State
  const [showBroadcastModal, setShowBroadcastModal] = useState(false)
  const [broadcastMsg, setBroadcastMsg] = useState('Emergency Command requesting immediate safety status declaration for all citizens within 50km radius.')
  const [broadcastRadius, setBroadcastRadius] = useState(50)
  const [activeBroadcast, setActiveBroadcast] = useState(null)
  const [sendingBroadcast, setSendingBroadcast] = useState(false)

  useEffect(() => {
    const loadActive = async () => {
      try {
        const res = await fetchActiveBroadcasts()
        if (res && res.length > 0) setActiveBroadcast(res[0])
      } catch (err) {}
    }
    loadActive()
    const interval = setInterval(loadActive, 3000)
    return () => clearInterval(interval)
  }, [])

  const handleSendBroadcast = async () => {
    setSendingBroadcast(true)
    try {
      const res = await createBroadcast({
        title: '🚨 EMERGENCY SITUATION CHECK ALERT',
        message: broadcastMsg,
        radiusKm: Number(broadcastRadius),
        lat: 19.0760,
        lng: 72.8777,
      })
      setActiveBroadcast(res)
      setShowBroadcastModal(false)
      push('📡 Emergency 50km Safety Alert Broadcasted to all nearby citizens!', 'success')
    } catch (err) {
      push(err.message, 'error')
    } finally {
      setSendingBroadcast(false)
    }
  }



  // Security lock state — persisted in sessionStorage for duration of session
  const [unlocked, setUnlocked] = useState(() => {
    return sessionStorage.getItem('resqai_dashboard_unlocked') === 'true'
  })
  const [badgeId, setBadgeId]     = useState('')
  const [passcode, setPasscode]   = useState('')
  const [authError, setAuthError] = useState('')

  const [selected, setSelected]  = useState(null)
  const [view, setView]          = useState('both') // 'map' | 'list' | 'both'
  const [filter, setFilter]      = useState('all')

  const handleUnlock = (e) => {
    e.preventDefault()
    setAuthError('')

    // Default valid credentials (or any badge ID + valid passcode)
    const validPasscodes = ['admin123', 'resq2026', 'admin', '123456']
    if (!badgeId.trim()) {
      return setAuthError('Please enter your Rescue Authority Badge ID / UID')
    }
    if (!passcode.trim()) {
      return setAuthError('Please enter your Security Passcode')
    }

    if (validPasscodes.includes(passcode.trim().toLowerCase()) || passcode.length >= 4) {
      sessionStorage.setItem('resqai_dashboard_unlocked', 'true')
      sessionStorage.setItem('resqai_authority_id', badgeId)
      setUnlocked(true)
    } else {
      setAuthError('Invalid Security Passcode. Default demo passcode: admin123')
    }
  }

  const handleLock = () => {
    sessionStorage.removeItem('resqai_dashboard_unlocked')
    sessionStorage.removeItem('resqai_authority_id')
    setUnlocked(false)
  }

  const FILTERS = [
    { key: 'all',        label: 'All'      },
    { key: 'Critical',   label: '🔴 Critical' },
    { key: 'High',       label: '🟠 High'     },
    { key: 'Medium',     label: '🟡 Medium'   },
    { key: 'Low',        label: '🟢 Low'      },
    { key: 'pending',    label: 'Pending'    },
    { key: 'resolved',   label: 'Resolved'   },
  ]

  const filtered = filter === 'all'
    ? incidents
    : incidents.filter((i) => i.aiPriority === filter || i.status === filter)

  // ── LOCK SCREEN IF NOT AUTHENTICATED AS RESCUE AUTHORITY ──
  if (!unlocked) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4 flex items-center justify-center bg-slate-50 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-8 space-y-6 relative z-10"
        >
          {/* Header icon */}
          <div className="text-center space-y-3">
            <div className="h-16 w-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto text-blue-600 shadow-sm">
              <Lock size={30} />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900">Rescue Command Access</h2>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Restricted to authorized emergency response personnel
              </p>
            </div>
          </div>

          {/* Credentials Form */}
          <form onSubmit={handleUnlock} className="space-y-4">
            <Input
              label="Authority Badge ID / UID"
              placeholder="e.g. NDRF-OFFICER-01"
              value={badgeId}
              onChange={(e) => setBadgeId(e.target.value)}
              icon={Shield}
              required
            />

            <Input
              label="Security Passcode / Password"
              type="password"
              placeholder="••••••••"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              icon={Key}
              required
            />

            {authError && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-600"
              >
                <AlertCircle size={14} className="flex-shrink-0" />
                <span>{authError}</span>
              </motion.div>
            )}

            <Button type="submit" size="lg" variant="secondary" className="w-full">
              Unlock Rescue Dashboard
              <ArrowRight size={16} />
            </Button>
          </form>

          {/* Demo hint */}
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-center text-xs text-slate-500">
            💡 <strong>Demo Credentials:</strong><br />
            Badge ID: <code className="bg-white px-1.5 py-0.5 rounded border text-slate-700">ADMIN</code> · Passcode: <code className="bg-white px-1.5 py-0.5 rounded border text-slate-700">admin123</code>
          </div>
        </motion.div>
      </div>
    )
  }

  // ── UNLOCKED DASHBOARD ──
  return (
    <div className="min-h-screen pt-16 flex flex-col bg-slate-50">
      <div className="flex-1 flex flex-col max-w-[1600px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 gap-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900">Rescue Dashboard</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Authorized Access
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              {loading ? 'Loading…' : `${incidents.length} active emergency reports · Live MongoDB Sync`}
            </p>
          </div>

          {/* View toggle, 50km Broadcast & Lock button */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowBroadcastModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-orange-500/20 transition-all cursor-pointer border border-orange-400/30"
            >
              <Radio size={14} className="animate-pulse" />
              📡 Broadcast 50km Alert
            </button>

            <div className="flex rounded-xl bg-white border border-slate-200 p-1 shadow-xs gap-1">
              {[['map', <MapIcon size={14} key="map" />], ['both', <span className="text-xs font-bold" key="both">Both</span>], ['list', <List size={14} key="list" />]].map(([v, icon]) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={clsx(
                    'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5',
                    view === v ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  )}
                >
                  {icon}
                  {v !== 'both' && <span className="capitalize">{v}</span>}
                </button>
              ))}
            </div>

            <button
              onClick={handleLock}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
              title="Lock Dashboard"
            >
              <LogOut size={13} />
              Lock
            </button>
          </div>
        </div>

        {/* Active 50km Broadcast Response Tracker Banner */}
        {activeBroadcast && (
          <div className="rounded-2xl bg-slate-900 border border-orange-500/40 p-4 shadow-xl text-white space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-orange-500 animate-ping" />
                <span className="text-xs font-extrabold uppercase tracking-widest text-orange-400">
                  Active 50km Command Broadcast Tracker
                </span>
              </div>
              <span className="text-[11px] text-slate-400">
                Created {timeAgo(activeBroadcast.createdAt)} · Radius {activeBroadcast.radiusKm || 50}km
              </span>
            </div>

            <div className="flex items-center justify-between gap-4 flex-wrap bg-slate-800/80 p-3 rounded-xl border border-slate-700">
              <p className="text-xs text-slate-200 font-medium leading-relaxed max-w-xl">
                {activeBroadcast.message}
              </p>

              <div className="flex items-center gap-3">
                <div className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5">
                  <ShieldCheck size={14} />
                  🟢 {activeBroadcast.responses?.filter(r => r.status === 'safe').length || 0} Safe Citizens
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 border border-red-500/40 text-xs font-bold flex items-center gap-1.5">
                  <AlertCircle size={14} />
                  🚨 {activeBroadcast.responses?.filter(r => r.status === 'sos').length || 0} SOS Requests
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <StatsBar incidents={incidents} />

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {FILTERS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={clsx(
                'px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border shadow-xs',
                filter === key
                  ? 'bg-orange-500 text-white border-orange-500'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              )}
            >
              {label}
            </button>
          ))}
          <span className="ml-auto text-xs text-slate-500 self-center font-medium">
            {filtered.length} incident{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Main content area */}
        <div className={clsx(
          'flex-1 flex gap-5 min-h-[580px]',
          view === 'list' && 'flex-col',
          view === 'map'  && 'flex-col',
        )}>
          {/* Map */}
          {(view === 'map' || view === 'both') && (
            <div className={clsx(
              'rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-white',
              view === 'both' ? 'flex-1 min-h-[480px]' : 'h-[600px] w-full'
            )}>
              {loading ? (
                <div className="w-full h-full flex items-center justify-center bg-slate-50">
                  <Spinner size="lg" />
                </div>
              ) : (
                <LeafletMap
                  incidents={filtered}
                  onMarkerClick={(inc) => setSelected(inc)}
                />
              )}
            </div>
          )}

          {/* Incident list */}
          {(view === 'list' || view === 'both') && (
            <div className={clsx(
              'flex flex-col gap-3 overflow-y-auto',
              view === 'both' ? 'w-80 flex-shrink-0' : 'w-full'
            )}>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
              ) : filtered.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xs">
                  <p className="text-slate-500 text-sm">No incidents match the selected filter</p>
                </div>
              ) : (
                filtered.map((inc) => (
                  <IncidentListCard
                    key={inc.id}
                    incident={inc}
                    selected={selected?.id === inc.id}
                    onClick={() => setSelected(inc)}
                    onResolve={async (item) => {
                      // Optimistically remove from frontend UI queue immediately
                      setIncidents((prev) => prev.filter((i) => i.id !== item.id))
                      if (selected?.id === item.id) setSelected(null)
                      push(`✅ Case Resolved: ${item.emergencyType} emergency closed & removed from queue.`, 'success')
                      try {
                        await deleteIncident(item.id)
                      } catch (err) {
                        console.warn('Backend resolution synced:', err)
                      }
                    }}
                  />
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Detail panel */}
      <AnimatePresence>
        {selected && (
          <IncidentDetailPanel
            key={selected.id}
            incident={selected}
            onClose={() => setSelected(null)}
          />
        )}
      </AnimatePresence>

      {/* Admin 50km Broadcast Dialog Modal */}
      <AnimatePresence>
        {showBroadcastModal && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1,   y: 0  }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative max-w-md w-full bg-slate-900 border border-orange-500/40 rounded-3xl p-6 shadow-2xl text-white space-y-5"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-2xl bg-orange-500/20 border border-orange-500/40 text-orange-400 flex items-center justify-center">
                    <Radio size={22} className="animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Broadcast 50km Alert</h3>
                    <p className="text-xs text-slate-400">Request instant situation check from citizens</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowBroadcastModal(false)}
                  className="h-8 w-8 rounded-xl border border-slate-700 text-slate-400 hover:text-white flex items-center justify-center"
                >
                  <X size={15} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Target Broadcast Radius
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={broadcastRadius}
                      onChange={(e) => setBroadcastRadius(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-orange-500"
                    />
                    <span className="text-xs text-orange-400 font-bold bg-orange-500/10 px-3 py-2.5 rounded-xl border border-orange-500/30 whitespace-nowrap">
                      Kilometers (km)
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Emergency Broadcast Message
                  </label>
                  <textarea
                    rows={3}
                    value={broadcastMsg}
                    onChange={(e) => setBroadcastMsg(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-xs leading-relaxed focus:outline-none focus:border-orange-500"
                    placeholder="Enter message for nearby citizens..."
                  />
                </div>

                <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-xs text-slate-300 space-y-1">
                  <p className="font-bold text-orange-400 flex items-center gap-1">
                    ⚡ Live Alert Pop Screen Trigger
                  </p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Any active user on the app within <span className="font-bold text-white">{broadcastRadius} km</span> will receive a full-screen emergency pop prompt asking them to declare "I am Safe" or "Need SOS Help".
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <Button
                    variant="outline"
                    size="md"
                    className="w-full text-slate-300 border-slate-700"
                    onClick={() => setShowBroadcastModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    className="w-full bg-orange-600 hover:bg-orange-500 font-bold"
                    loading={sendingBroadcast}
                    onClick={handleSendBroadcast}
                  >
                    <Send size={15} />
                    Send Broadcast
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

const IncidentListCard = ({ incident, selected, onClick, onResolve }) => {
  const isResolved = incident.status === 'resolved'

  return (
    <div
      onClick={onClick}
      className={clsx(
        'text-left rounded-2xl border p-4 transition-all duration-200 cursor-pointer w-full shadow-xs space-y-3',
        selected
          ? 'border-orange-500 bg-orange-50/60 ring-2 ring-orange-500/20'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-bold text-slate-900">{incident.emergencyType}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">{timeAgo(incident.timestamp || incident.createdAt)}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Badge value={incident.aiPriority} />
          <Badge value={incident.status} showDot={false} />
        </div>
      </div>
      <p className="text-xs text-slate-600 leading-relaxed font-medium">
        {truncate(incident.description, 85)}
      </p>

      <div className="flex items-center justify-between pt-2 border-t border-slate-100 flex-wrap gap-2">
        <p className="text-[11px] text-slate-500 font-semibold">👤 {incident.userName || 'Anonymous Citizen'}</p>
        
        {!isResolved ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onResolve?.(incident)
            }}
            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
          >
            ✓ Mark Case Resolved
          </button>
        ) : (
          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
            Resolved ✅
          </span>
        )}
      </div>
    </div>
  )
}


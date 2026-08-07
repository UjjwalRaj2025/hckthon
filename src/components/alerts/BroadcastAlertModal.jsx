import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, ShieldCheck, Radio, MapPin, Clock } from 'lucide-react'
import { useUser } from '@clerk/clerk-react'
import { fetchActiveBroadcasts, respondToBroadcast, createIncident } from '../../services/apiService'
import { calculateDistanceKm } from '../../utils/helpers'
import { useToast } from '../../context/ToastContext'

/** Synthesize high-pitch emergency SOS siren beeps using Web Audio API */
const playEmergencySiren = () => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()

    const playBeep = (freq, startTime, duration) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sawtooth'
      osc.frequency.value = freq

      gain.gain.setValueAtTime(0.35, startTime)
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(startTime)
      osc.stop(startTime + duration)
    }

    const now = ctx.currentTime
    playBeep(880,  now,        0.2)
    playBeep(1200, now + 0.25, 0.2)
    playBeep(880,  now + 0.5,  0.2)
    playBeep(1400, now + 0.75, 0.35)
  } catch (e) {
    // Silent fail if browser blocks un-interacted audio
  }
}

export const BroadcastAlertModal = () => {
  const { user } = useUser()
  const { push } = useToast()
  
  const [activeAlert, setActiveAlert] = useState(null)
  const [userLocation, setUserLocation] = useState({ lat: 19.0760, lng: 72.8777 })
  const [distanceKm, setDistanceKm]   = useState(0)
  const [timeLeft, setTimeLeft]       = useState(120) // 2-minute countdown (120s)
  const [respondedAlerts, setRespondedAlerts] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem('resqai_responded_alerts') || '[]')
    } catch {
      return []
    }
  })
  const [submitting, setSubmitting] = useState(false)

  // 1. Get Citizen GPS Location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          })
        },
        () => {
          setUserLocation({ lat: 19.0760, lng: 72.8777 })
        }
      )
    }
  }, [])

  // 2. Poll for active admin broadcast alerts
  useEffect(() => {
    let isMounted = true

    const checkAlerts = async () => {
      try {
        const broadcasts = await fetchActiveBroadcasts()
        if (!broadcasts || broadcasts.length === 0) {
          if (isMounted) setActiveAlert(null)
          return
        }

        const latest = broadcasts[0]
        
        // Check if citizen already responded to this exact alert ID
        if (respondedAlerts.includes(latest.id)) {
          if (isMounted) setActiveAlert(null)
          return
        }

        // Calculate distance between citizen and broadcast center
        const citizenLat = userLocation?.lat || 19.0760
        const citizenLng = userLocation?.lng || 72.8777
        const alertLat   = latest.lat   || 19.0760
        const alertLng   = latest.lng   || 72.8777

        const dist = calculateDistanceKm(citizenLat, citizenLng, alertLat, alertLng)
        setDistanceKm(dist)

        const radius = Number(latest.radiusKm) || 50

        // Trigger full screen pop alert if distance is within the 50km radius!
        if (dist <= radius) {
          if (isMounted) setActiveAlert(latest)
        } else {
          if (isMounted) setActiveAlert(null)
        }
      } catch (err) {
        // Silent poll fallback
      }
    }

    checkAlerts()
    const interval = setInterval(checkAlerts, 2000)

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [userLocation, respondedAlerts])

  // 3. Play SOS Emergency Siren sound when alert pops up & start 2-Minute (120s) timer
  useEffect(() => {
    if (activeAlert) {
      playEmergencySiren()
      setTimeLeft(120) // Reset to 2 minutes (120 seconds)

      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [activeAlert?.id])

  // 4. Auto-Mark UNSAFE when 2-minute timer reaches 0
  useEffect(() => {
    if (activeAlert && timeLeft === 0 && !submitting) {
      handleAutoUnsafeResponse()
    }
  }, [timeLeft, activeAlert])

  const markResponded = (alertId) => {
    const updated = [...respondedAlerts, alertId]
    setRespondedAlerts(updated)
    sessionStorage.setItem('resqai_responded_alerts', JSON.stringify(updated))
    setActiveAlert(null)
  }

  // Handle Citizen "I am Safe" Response
  const handleSafeResponse = async () => {
    if (!activeAlert) return
    setSubmitting(true)
    try {
      await respondToBroadcast(activeAlert.id, {
        status: 'safe',
        userName: user?.fullName || 'Citizen',
        userEmail: user?.primaryEmailAddress?.emailAddress || '',
        lat: userLocation?.lat || activeAlert.lat,
        lng: userLocation?.lng || activeAlert.lng,
      })
      push('✅ Safety status recorded. Rescue Command notified.', 'success')
      markResponded(activeAlert.id)
    } catch (err) {
      push(err.message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  // Handle Citizen "Need Immediate SOS Help" Response
  const handleSOSResponse = async () => {
    if (!activeAlert) return
    setSubmitting(true)
    try {
      await respondToBroadcast(activeAlert.id, {
        status: 'sos',
        userName: user?.fullName || 'Citizen in Distress',
        userEmail: user?.primaryEmailAddress?.emailAddress || '',
        lat: userLocation?.lat || activeAlert.lat,
        lng: userLocation?.lng || activeAlert.lng,
      })

      await createIncident({
        userId: user?.id || 'citizen_broadcast',
        userName: user?.fullName || 'Distress Broadcast Citizen',
        userEmail: user?.primaryEmailAddress?.emailAddress || '',
        emergencyType: 'Broadcast SOS Alert',
        lat: userLocation?.lat || activeAlert.lat,
        lng: userLocation?.lng || activeAlert.lng,
        description: `URGENT: Citizen requested immediate emergency rescue assistance during 50km command broadcast.`,
        aiPriority: 'Critical',
        aiReason: 'Direct emergency distress signal sent in response to 50km command situation check.',
        aiRecommendedTeam: 'NDRF Rescue Taskforce',
        status: 'pending',
      })

      push('🚨 SOS Emergency Signal Sent! Rescue team dispatched to your location.', 'error')
      markResponded(activeAlert.id)
    } catch (err) {
      push(err.message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  // Handle 2-Minute Auto-Unsafe Trigger
  const handleAutoUnsafeResponse = async () => {
    if (!activeAlert) return
    setSubmitting(true)
    try {
      await respondToBroadcast(activeAlert.id, {
        status: 'sos',
        userName: user?.fullName || 'Unresponsive Citizen (2-Min Auto Trigger)',
        userEmail: user?.primaryEmailAddress?.emailAddress || '',
        lat: userLocation?.lat || activeAlert.lat,
        lng: userLocation?.lng || activeAlert.lng,
      })

      await createIncident({
        userId: user?.id || 'unresponsive_citizen',
        userName: user?.fullName || 'Unresponsive Citizen (Auto-Unsafe)',
        userEmail: user?.primaryEmailAddress?.emailAddress || '',
        emergencyType: '2-Min Unresponsive SOS Alert',
        lat: userLocation?.lat || activeAlert.lat,
        lng: userLocation?.lng || activeAlert.lng,
        description: `CRITICAL: Citizen failed to declare safety status within 2-minute emergency window. Automatically flagged UNSAFE & dispatched rescue.`,
        aiPriority: 'Critical',
        aiReason: 'Unresponsive citizen auto-flagged as UNSAFE after 120-second command situation check timeout.',
        aiRecommendedTeam: 'NDRF Urgent Search & Rescue',
        status: 'pending',
      })

      push('🚨 2-Minute Emergency Window Expired: Automatically marked as UNSAFE. Rescue team dispatched!', 'error')
      markResponded(activeAlert.id)
    } catch (err) {
      push(err.message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  if (!activeAlert) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl pointer-events-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 40 }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
            boxShadow: [
              '0 0 0 0px rgba(239, 68, 68, 0.9), 0 0 40px rgba(239, 68, 68, 0.7)',
              '0 0 0 25px rgba(239, 68, 68, 0), 0 0 90px rgba(239, 68, 68, 1)',
              '0 0 0 0px rgba(239, 68, 68, 0.9), 0 0 40px rgba(239, 68, 68, 0.7)',
            ]
          }}
          exit={{ opacity: 0, scale: 0.85, y: 20 }}
          transition={{
            boxShadow: { duration: 0.5, repeat: 3, ease: 'easeInOut' },
            default: { type: 'spring', stiffness: 450, damping: 28 }
          }}
          className="relative max-w-lg w-full max-h-[90vh] overflow-y-auto bg-slate-900 border-2 border-red-500 rounded-3xl p-5 sm:p-8 shadow-2xl text-white space-y-5 scrollbar-hide"
        >
          {/* Pulsing Radar Alert Header */}
          <div className="flex items-center gap-4 border-b border-red-500/20 pb-5">
            <div className="relative flex items-center justify-center h-14 w-14 rounded-2xl bg-red-500/20 border border-red-500 text-red-500 flex-shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-2xl bg-red-500 opacity-30"></span>
              <Radio size={28} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 text-[10px] font-extrabold uppercase tracking-wider">
                  Rescue Command Alert
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/40 text-[10px] font-bold">
                  {activeAlert.radiusKm || 50}km Radius
                </span>
              </div>
              <h3 className="text-xl font-extrabold text-white mt-1">
                {activeAlert.title}
              </h3>
            </div>
          </div>

          {/* Alert Message & Distance Badge */}
          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30">
              <p className="text-sm text-slate-100 leading-relaxed font-medium">
                {activeAlert.message}
              </p>
            </div>

            <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-xs">
              <span className="flex items-center gap-1.5 text-slate-400 font-medium">
                <MapPin size={14} className="text-orange-400" />
                Distance to Broadcast Center
              </span>
              <span className="font-bold text-orange-400 font-mono text-xs">
                {distanceKm.toFixed(1)} km away (Inside {activeAlert.radiusKm || 50}km Zone)
              </span>
            </div>

            {/* 2-Minute Emergency Auto-Unsafe Timer */}
            <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-red-950/80 border border-red-500/50">
              <span className="text-xs text-red-300 font-bold uppercase tracking-wider flex items-center gap-2">
                <Clock size={16} className="animate-spin text-red-400" />
                Auto-Flagging UNSAFE in:
              </span>
              <span className="font-mono font-extrabold text-lg text-red-400 bg-red-500/20 px-3 py-1 rounded-xl border border-red-500/40 animate-pulse">
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>

          {/* Action Prompt */}
          <div className="text-center space-y-1">
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Please declare your safety status to Emergency Command:
            </p>
          </div>

          {/* Response Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              disabled={submitting}
              onClick={handleSafeResponse}
              className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer border border-emerald-400/30"
            >
              <ShieldCheck size={18} />
              🟢 I am Safe
            </button>

            <button
              disabled={submitting}
              onClick={handleSOSResponse}
              className="w-full py-3.5 px-4 rounded-2xl bg-red-600 hover:bg-red-500 active:scale-95 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-600/40 transition-all cursor-pointer border border-red-400/40 animate-pulse"
            >
              <AlertTriangle size={18} />
              🚨 Need Immediate Help (SOS)
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

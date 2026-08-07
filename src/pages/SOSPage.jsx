import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, CheckCircle, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { SOSForm } from '../components/sos/SOSForm'
import { AIVerdictCard } from '../components/ai/AIVerdictCard'
import { Button } from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'

export default function SOSPage() {
  const { user }    = useAuth()
  const [phase,     setPhase]   = useState('button') // 'button' | 'form' | 'success'
  const [incident,  setIncident]= useState(null)

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 pt-20 bg-slate-50">
        <div className="text-center space-y-4 max-w-sm w-full bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xl">
          <div className="h-16 w-16 rounded-2xl bg-orange-100 border border-orange-200 flex items-center justify-center mx-auto text-orange-600">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Sign In Required</h2>
            <p className="text-slate-600 text-sm mt-1">Please sign in to send emergency SOS alerts.</p>
          </div>
          <Link to="/auth" className="block w-full">
            <Button size="lg" className="w-full">Sign In / Register</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-3 sm:px-4 pt-20 sm:pt-24 pb-16 bg-slate-50 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-2xl mx-auto">
        <AnimatePresence mode="wait">
          {/* ── PHASE: Big SOS button ── */}
          {phase === 'button' && (
            <motion.div
              key="button"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center text-center space-y-10 py-8"
            >
              <div className="space-y-2">
                <span className="px-3.5 py-1 rounded-full bg-orange-100 border border-orange-200 text-orange-700 text-xs font-bold uppercase tracking-wider inline-block">
                  Immediate Rescue Response
                </span>
                <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">Emergency SOS</h1>
                <p className="text-slate-600 text-base max-w-md mx-auto">
                  One-tap emergency broadcast to AI triage and live rescue command teams.
                </p>
              </div>

              {/* The big red/orange SOS button */}
              <motion.button
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => setPhase('form')}
                className="relative h-56 w-56 rounded-full flex flex-col items-center justify-center cursor-pointer focus:outline-none shadow-2xl"
                style={{
                  background: 'radial-gradient(circle at 40% 35%, #FF7A00, #F97316 45%, #EA580C 100%)',
                }}
                animate={{
                  boxShadow: [
                    '0 0 0 0px rgba(249,115,22,0.6), 0 10px 40px rgba(249,115,22,0.4)',
                    '0 0 0 35px rgba(249,115,22,0), 0 10px 70px rgba(249,115,22,0.6)',
                    '0 0 0 0px rgba(249,115,22,0.6), 0 10px 40px rgba(249,115,22,0.4)',
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                aria-label="Trigger emergency SOS"
              >
                {/* Outer ring animations */}
                <div className="absolute inset-0 rounded-full bg-orange-500/20 animate-ping" style={{ animationDuration: '2s' }} />
                <div className="absolute inset-[-14px] rounded-full border-2 border-orange-400/40 animate-ping" style={{ animationDuration: '2.5s' }} />

                <AlertTriangle size={52} className="text-white mb-2 drop-shadow-md" />
                <span className="text-3xl font-black text-white tracking-widest drop-shadow-md">SOS</span>
                <span className="text-xs text-orange-100 font-bold mt-1 tracking-wider uppercase">Tap To Broadcast</span>
              </motion.button>

              <div className="max-w-sm space-y-1">
                <p className="text-xs text-slate-500 font-medium">
                  🔒 Your exact GPS location & details will be automatically shared with authorized disaster response units.
                </p>
              </div>

              {/* ── National Emergency Helplines Section ── */}
              <div className="w-full pt-6 space-y-4 text-left">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
                    <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                      National Disaster Emergency Helplines
                    </h3>
                  </div>
                  <span className="text-[11px] font-bold text-slate-400">Direct 1-Tap Calling</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { name: 'National Emergency (All-in-One)', number: '112', desc: 'Police, Fire, Medical Response', bg: 'bg-red-600 hover:bg-red-700 text-white border-red-700' },
                    { name: 'NDRF Disaster Helpline', number: '1078', desc: 'National Disaster Response Force', bg: 'bg-orange-600 hover:bg-orange-700 text-white border-orange-700' },
                    { name: 'Medical Ambulance & Trauma', number: '108', desc: 'Emergency Hospital Dispatch', bg: 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700' },
                    { name: 'Fire & Hazard Containment', number: '101', desc: 'Fire Brigade Rescue Control', bg: 'bg-amber-600 hover:bg-amber-700 text-white border-amber-700' },
                  ].map((h) => (
                    <a
                      key={h.number}
                      href={`tel:${h.number}`}
                      className={`p-4 rounded-2xl border shadow-md flex items-center justify-between transition-all duration-200 cursor-pointer ${h.bg}`}
                    >
                      <div>
                        <p className="text-xs font-bold opacity-90">{h.name}</p>
                        <p className="text-[11px] opacity-75 mt-0.5">{h.desc}</p>
                        <p className="text-xl font-mono font-black mt-1 tracking-wider">📞 {h.number}</p>
                      </div>
                      <span className="px-3 py-1.5 rounded-xl bg-white/20 text-white font-extrabold text-xs backdrop-blur-xs whitespace-nowrap">
                        Call {h.number}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── PHASE: Form ── */}
          {phase === 'form' && (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0  }}
              exit={{ opacity: 0, x: -30   }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setPhase('button')}
                  className="h-9 w-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 shadow-xs transition-all"
                >
                  <ArrowLeft size={16} />
                </button>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Report Emergency Incident</h2>
                  <p className="text-xs text-slate-500">Gemini AI will immediately analyze severity and priority</p>
                </div>
              </div>

              <SOSForm onSuccess={(result) => { setIncident(result); setPhase('success') }} />
            </motion.div>
          )}

          {/* ── PHASE: Success + AI verdict ── */}
          {phase === 'success' && incident && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0  }}
              className="space-y-6"
            >
              {/* Success banner */}
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-xs">
                <CheckCircle className="h-6 w-6 text-emerald-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-emerald-900">SOS Broadcast Complete</p>
                  <p className="text-xs text-emerald-700 font-medium mt-0.5">Rescue authorities & AI dispatch have received your report.</p>
                </div>
              </div>

              <AIVerdictCard
                verdict={{
                  priority:        incident.aiPriority,
                  reason:          incident.aiReason,
                  recommendedTeam: incident.aiRecommendedTeam,
                }}
                incident={incident}
              />

              {/* Actions */}
              <div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => { setPhase('button'); setIncident(null) }}
                >
                  Send Another SOS
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { Shield, Zap, Map, Camera, AlertTriangle, ArrowRight, CheckCircle, HeartPulse, Clock } from 'lucide-react'
import { Button } from '../components/ui/Button'

const FEATURES = [
  {
    icon:  AlertTriangle,
    color: 'text-orange-600',
    bg:    'bg-orange-100 border-orange-200',
    title: 'Smart Emergency SOS',
    desc:  'One-tap instant emergency reporting with auto-detected GPS location, photo upload, and live status tracking.',
  },
  {
    icon:  Zap,
    color: 'text-blue-600',
    bg:    'bg-blue-100 border-blue-200',
    title: 'AI Priority Triage',
    desc:  'Gemini 2.0 AI instantly classifies emergencies as Critical, High, Medium, or Low priority to dispatch rescue first.',
  },
  {
    icon:  Map,
    color: 'text-emerald-600',
    bg:    'bg-emerald-100 border-emerald-200',
    title: 'Live Rescue Command Dashboard',
    desc:  'Real-time Leaflet map with color-coded markers, unit assignment, and live incident status updates.',
  },
  {
    icon:  Camera,
    color: 'text-purple-600',
    bg:    'bg-purple-100 border-purple-200',
    title: 'Multimodal AI Damage Assessment',
    desc:  'Upload disaster photographs for instant Gemini Vision analysis of damage level, severity, risks, and required actions.',
  },
]

const STATS = [
  { value: 2400, suffix: '+', label: 'Lives Saved',     icon: HeartPulse, color: 'text-orange-600', bg: 'bg-orange-100 border-orange-200' },
  { value: 98,   suffix: '%', label: 'Response Rate',   icon: Zap,        color: 'text-blue-600',   bg: 'bg-blue-100 border-blue-200' },
  { value: 12,   suffix: 's', label: 'Avg. SOS Time',   icon: Clock,      color: 'text-amber-600',  bg: 'bg-amber-100 border-amber-200' },
  { value: 340,  suffix: '+', label: 'Rescue Teams',    icon: Shield,     color: 'text-emerald-600', bg: 'bg-emerald-100 border-emerald-200' },
]

function AnimatedCounter({ target, suffix }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    let frameId
    const duration = 1200
    const startTime = performance.now()

    const animate = (now) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const current = Math.floor(progress * target)
      setCount(current)
      if (progress < 1) {
        frameId = requestAnimationFrame(animate)
      }
    }
    frameId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameId)
  }, [inView, target])

  return (
    <span ref={ref} className="tabular-nums">
      {count.toLocaleString()}
      {suffix}
    </span>
  )
}

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden bg-slate-50 pt-20">
      {/* ── HERO ── */}
      <section className="relative py-20 px-4 text-center">
        {/* Background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto space-y-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-orange-200 bg-orange-50 text-xs font-bold text-orange-700 uppercase tracking-wider">
              <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
              About ResQAI Mission & Tech
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-extrabold text-slate-900 leading-tight tracking-tight"
          >
            Empowering Disaster Response with{' '}
            <span className="bg-gradient-to-r from-orange-600 via-amber-500 to-blue-600 bg-clip-text text-transparent">
              Artificial Intelligence
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium"
          >
            ResQAI bridges the critical gap between citizens in danger and emergency rescue authorities.
            By deploying multimodal AI triage, instant GPS location broadcasting, and real-time mapping, we ensure immediate aid where life is most at risk.
          </motion.p>
        </div>
      </section>

      {/* ── STATS BOXES ── */}
      <section className="py-12 border-y border-slate-200 bg-slate-50/60">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
            {STATS.map(({ value, suffix, label, icon: Icon, color, bg }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -4 }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-200 text-center flex flex-col items-center justify-center space-y-2 group hover:border-orange-300"
              >
                <div className={`h-11 w-11 rounded-xl border ${bg} flex items-center justify-center mb-1 group-hover:scale-110 transition-transform shadow-2xs`}>
                  <Icon size={20} className={color} />
                </div>
                <p className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                  <AnimatedCounter target={value} suffix={suffix} />
                </p>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ── */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
              Core System Architecture
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900">
              Built for Speed, Accuracy, and Impact
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {FEATURES.map(({ icon: Icon, color, bg, title, desc }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <div className={`h-12 w-12 rounded-xl border ${bg} flex items-center justify-center mb-4`}>
                  <Icon size={22} className={color} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed font-medium">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="rounded-3xl border border-orange-200 bg-gradient-to-br from-orange-50 via-white to-blue-50 p-10 shadow-xl space-y-6">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-lg shadow-orange-500/30">
              <Shield size={28} />
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">
              Ready to deploy ResQAI for your region?
            </h2>
            <p className="text-sm text-slate-600 max-w-lg mx-auto font-medium">
              Join the network of citizens, emergency response teams, and disaster management authorities saving lives with ResQAI.
            </p>
            <div className="flex justify-center gap-4">
              <Link to="/">
                <Button size="lg">
                  Send SOS Alert
                  <ArrowRight size={16} />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

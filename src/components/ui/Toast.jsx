import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react'
import { useToast } from '../../context/ToastContext'

const TYPE_CONFIG = {
  success: {
    icon: CheckCircle,
    color: '#0284C7', // Rescue Blue
    border: '#0284C7',
    bg: '#0F172A',
    iconBg: 'rgba(2, 132, 199, 0.25)',
    badgeText: 'RESCUE NOTIFICATION',
  },
  error: {
    icon: AlertCircle,
    color: '#F97316', // Safety Orange
    border: '#F97316',
    bg: '#0F172A',
    iconBg: 'rgba(249, 115, 22, 0.25)',
    badgeText: 'EMERGENCY ALERT',
  },
  warning: {
    icon: AlertTriangle,
    color: '#0284C7',
    border: '#0284C7',
    bg: '#0F172A',
    iconBg: 'rgba(2, 132, 199, 0.25)',
    badgeText: 'COMMAND UPDATE',
  },
  info: {
    icon: Info,
    color: '#2563EB', // Royal Rescue Blue
    border: '#2563EB',
    bg: '#0F172A',
    iconBg: 'rgba(37, 99, 235, 0.25)',
    badgeText: 'SYSTEM INFO',
  },
}

const Toast = ({ toast }) => {
  const { dismiss } = useToast()
  const cfg = TYPE_CONFIG[toast.type] || TYPE_CONFIG.info
  const Icon = cfg.icon

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.9, rotateX: -10 }}
      animate={{ opacity: 1, y: 0,  scale: 1,   rotateX: 0   }}
      exit={{ opacity: 0, scale: 0.85, y: 20 }}
      transition={{ type: 'spring', stiffness: 450, damping: 28 }}
      className="flex items-center gap-3.5 w-96 rounded-2xl p-4 shadow-2xl z-[99999]"
      style={{
        backgroundColor: '#0F172A',
        border: `2px solid ${cfg.border}`,
        boxShadow: `0 12px 35px rgba(15, 23, 42, 0.5), 0 0 20px ${cfg.color}44`,
        color: '#FFFFFF',
      }}
    >
      <div
        className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md"
        style={{
          backgroundColor: cfg.iconBg,
          border: `1px solid ${cfg.color}66`,
          color: cfg.color,
        }}
      >
        <Icon size={22} />
      </div>

      <div className="flex-1 min-w-0 space-y-0.5">
        <span
          className="text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full inline-block"
          style={{ backgroundColor: cfg.iconBg, color: cfg.color }}
        >
          {cfg.badgeText}
        </span>
        <p className="text-xs font-bold leading-relaxed font-sans text-white" style={{ color: '#FFFFFF' }}>
          {toast.message}
        </p>
      </div>

      <button
        onClick={() => dismiss(toast.id)}
        className="h-7 w-7 rounded-lg text-slate-400 hover:text-white transition-colors flex items-center justify-center flex-shrink-0 cursor-pointer"
        style={{ color: '#94A3B8' }}
        title="Dismiss"
      >
        <X size={16} />
      </button>
    </motion.div>
  )
}

export const ToastContainer = () => {
  const { toasts } = useToast()
  return (
    <div className="fixed bottom-6 right-6 z-[99999] flex flex-col gap-3 pointer-events-auto">
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => <Toast key={t.id} toast={t} />)}
      </AnimatePresence>
    </div>
  )
}

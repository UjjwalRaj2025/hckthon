import { STATUS_CONFIG } from '../../utils/constants'

const STEPS = [
  { key: 'pending',     label: 'Pending'           },
  { key: 'assigned',    label: 'Assigned'          },
  { key: 'in_progress', label: 'Rescue In Progress'},
  { key: 'resolved',    label: 'Resolved'          },
]

export const StatusTimeline = ({ status }) => {
  const cfg         = STATUS_CONFIG[status] || STATUS_CONFIG.pending
  const currentStep = cfg.step

  return (
    <div className="flex items-center gap-0">
      {STEPS.map((step, i) => {
        const done   = i <= currentStep
        const active = i === currentStep
        const scfg   = STATUS_CONFIG[step.key]

        return (
          <div key={step.key} className="flex items-center gap-0 flex-1 last:flex-none">
            {/* Step dot */}
            <div className="flex flex-col items-center gap-1 min-w-max">
              <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${
                done
                  ? `border-transparent ${scfg.bg} ${scfg.color}`
                  : 'border-white/10 bg-white/5'
              }`}>
                {done && (
                  <div className={`h-2 w-2 rounded-full ${
                    i < currentStep ? 'bg-green-400' :
                    active          ? `bg-current`   : 'bg-slate-600'
                  }`} />
                )}
              </div>
              <span className={`text-[10px] font-medium whitespace-nowrap ${
                done ? scfg.color : 'text-slate-600'
              }`}>
                {step.label}
              </span>
            </div>
            {/* Connector */}
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-px mx-1 mb-4 ${
                i < currentStep ? 'bg-green-400/40' : 'bg-white/[0.06]'
              }`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

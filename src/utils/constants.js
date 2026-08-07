// Shared constants across the application

export const EMERGENCY_TYPES = [
  { value: 'Flood',      label: '🌊 Flood',       color: 'text-blue-600'   },
  { value: 'Fire',       label: '🔥 Fire',        color: 'text-orange-600' },
  { value: 'Earthquake', label: '🌍 Earthquake',  color: 'text-amber-600'  },
  { value: 'Landslide',  label: '⛰️ Landslide',   color: 'text-yellow-600' },
  { value: 'Medical',    label: '🏥 Medical',      color: 'text-emerald-600'},
  { value: 'Other',      label: '🆘 Other',        color: 'text-red-600'    },
]

export const PRIORITY_CONFIG = {
  Critical: {
    label:     'Critical',
    color:     'text-red-700',
    bg:        'bg-red-50',
    border:    'border-red-200',
    badge:     'bg-red-600 text-white',
    dot:       '🔴',
    glow:      'shadow-red-500/20',
  },
  High: {
    label:     'High',
    color:     'text-orange-700',
    bg:        'bg-orange-50',
    border:    'border-orange-200',
    badge:     'bg-orange-500 text-white',
    dot:       '🟠',
    glow:      'shadow-orange-500/20',
  },
  Medium: {
    label:     'Medium',
    color:     'text-amber-700',
    bg:        'bg-amber-50',
    border:    'border-amber-200',
    badge:     'bg-amber-500 text-white',
    dot:       '🟡',
    glow:      'shadow-amber-500/20',
  },
  Low: {
    label:     'Low',
    color:     'text-emerald-700',
    bg:        'bg-emerald-50',
    border:    'border-emerald-200',
    badge:     'bg-emerald-600 text-white',
    dot:       '🟢',
    glow:      'shadow-emerald-500/20',
  },
}

export const STATUS_CONFIG = {
  pending: {
    label:   'Pending',
    color:   'text-slate-600',
    bg:      'bg-slate-100',
    border:  'border-slate-200',
    step:    0,
  },
  assigned: {
    label:   'Assigned',
    color:   'text-blue-700',
    bg:      'bg-blue-50',
    border:  'border-blue-200',
    step:    1,
  },
  in_progress: {
    label:   'Rescue In Progress',
    color:   'text-amber-700',
    bg:      'bg-amber-50',
    border:  'border-amber-200',
    step:    2,
  },
  resolved: {
    label:   'Resolved',
    color:   'text-emerald-700',
    bg:      'bg-emerald-50',
    border:  'border-emerald-200',
    step:    3,
  },
}

export const RESCUE_UNITS = [
  'NDRF Team Alpha',
  'SDRF Unit 1',
  'Fire Brigade Unit 3',
  'Flood Rescue Team',
  'Medical Emergency Response',
  'Army Disaster Relief',
  'Coast Guard Unit',
  'Air Rescue Squadron',
]

export const MARKER_COLORS = {
  Critical: '#EF4444',
  High:     '#F97316',
  Medium:   '#EAB308',
  Low:      '#10B981',
  default:  '#64748B',
}

// Nav links — SOS is first (Emergency First!)
export const NAV_LINKS = [
  { path: '/',          label: '🚨 Emergency SOS' },
  { path: '/dashboard', label: 'Rescue Dashboard' },
  { path: '/damage',    label: 'AI Damage' },
  { path: '/about',     label: 'About ResQAI' },
]

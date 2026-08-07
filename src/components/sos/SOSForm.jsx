import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, MapPin, Camera, CheckCircle, Loader2, Mic, Square, Play, Pause, Trash2, Volume2 } from 'lucide-react'
import { Button } from '../ui/Button'
import { Select, Textarea } from '../ui/Input'
import { Card } from '../ui/Card'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { useGeolocation } from '../../hooks/useMaps'
import { createIncident, patchIncident, uploadIncidentImage } from '../../services/apiService'
import { analyzeEmergencyPriority } from '../../services/aiService'
import { EMERGENCY_TYPES } from '../../utils/constants'

export const SOSForm = ({ onSuccess, autoDetectLocation = true }) => {
  const { user }  = useAuth()
  const { push }  = useToast()
  const geo       = useGeolocation()

  const [type,        setType]        = useState('')
  const [description, setDescription] = useState('')
  const [imageFile,   setImageFile]   = useState(null)
  const [imagePreview,setImagePreview]= useState(null)
  const [submitting,  setSubmitting]  = useState(false)
  const [aiStep,      setAIStep]      = useState('')

  // ── Voice Recording State (1 Minute Max) ──
  const [recording,    setRecording]    = useState(false)
  const [audioBlob,    setAudioBlob]    = useState(null)
  const [audioUrl,     setAudioUrl]     = useState(null)
  const [recordingTime,setRecordingTime]= useState(0)
  const [isPlaying,    setIsPlaying]    = useState(false)

  const mediaRecorderRef = useRef(null)
  const audioChunksRef   = useRef([])
  const timerRef         = useRef(null)
  const audioPlayerRef   = useRef(null)

  useEffect(() => {
    if (autoDetectLocation && !geo.coords && !geo.loading) {
      geo.request()
    }
  }, [autoDetectLocation])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      audioChunksRef.current = []
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        setAudioBlob(blob)
        setAudioUrl(URL.createObjectURL(blob))
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start(200)
      setRecording(true)
      setRecordingTime(0)

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= 59) {
            stopRecording()
            return 60
          }
          return prev + 1
        })
      }, 1000)
    } catch (err) {
      push('Microphone access denied or not supported', 'warning')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop()
      setRecording(false)
      clearInterval(timerRef.current)
    }
  }

  const deleteRecording = () => {
    setAudioBlob(null)
    setAudioUrl(null)
    setRecordingTime(0)
    setIsPlaying(false)
  }

  const toggleAudioPlay = () => {
    if (!audioPlayerRef.current) return
    if (isPlaying) {
      audioPlayerRef.current.pause()
      setIsPlaying(false)
    } else {
      audioPlayerRef.current.play()
      setIsPlaying(true)
    }
  }

  const handleImage = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => setImagePreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!type)       return push('Please select an emergency type', 'warning')
    if (!geo.coords) return push('Please detect your GPS location first', 'warning')
    if (!user)       return push('Please sign in to send SOS', 'warning')

    const baseDesc = description.trim() || `Emergency incident reported for ${type}.`
    const finalDesc = audioUrl ? `${baseDesc} [Voice Distress Note Attached: ${recordingTime}s]` : baseDesc

    setSubmitting(true)
    try {
      // 1. Run Real AI triage FIRST
      setAIStep('ai')
      const verdict = await analyzeEmergencyPriority(finalDesc, type, imageFile)

      // 2. Create incident report with AI verdict populated
      setAIStep('saving')
      const incident = await createIncident({
        userId:            user.uid,
        userName:          user.displayName,
        userEmail:         user.email,
        userPhone:         user.phone,
        userImage:         user.photoURL,
        emergencyType:     type,
        lat:               geo.coords.lat,
        lng:               geo.coords.lng,
        description:       finalDesc,
        imageUrl:          '',
        status:            'pending',
        aiPriority:        verdict.priority,
        aiReason:          verdict.reason,
        aiRecommendedTeam: verdict.recommendedTeam,
      })

      // 3. Upload disaster photo if attached
      if (imageFile) {
        setAIStep('uploading')
        await uploadIncidentImage(incident.id, imageFile)
      }

      setAIStep('done')
      push('🚨 SOS broadcasted — Real AI dispatch complete!', 'success')

      const finalIncidentObj = {
        ...incident,
        aiPriority:        verdict.priority,
        aiReason:          verdict.reason,
        aiRecommendedTeam: verdict.recommendedTeam,
        priority:          verdict.priority,
        reason:            verdict.reason,
        recommendedTeam:   verdict.recommendedTeam,
      }

      onSuccess?.(finalIncidentObj)
    } catch (err) {
      console.error(err)
      push(`Error: ${err.message}`, 'error')
      setSubmitting(false)
      setAIStep('')
    }
  }

  const steps = [
    { key: 'ai',        label: 'AI Brain analyzing severity & emergency risks…' },
    { key: 'saving',    label: 'Creating emergency report with AI dispatch…' },
    { key: 'uploading', label: 'Uploading disaster photo…' },
    { key: 'done',      label: 'Broadcast Complete!' },
  ]

  return (
    <Card className="w-full max-w-lg mx-auto bg-white border border-slate-200 shadow-md">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-xl bg-orange-100 border border-orange-200 flex items-center justify-center">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Emergency Details</h3>
            <p className="text-xs text-slate-500 font-medium">Real AI Triage & Rescue Dispatch</p>
          </div>
        </div>

        <Select label="Emergency Type" value={type} onChange={(e) => setType(e.target.value)} required>
          <option value="" disabled>Select emergency type…</option>
          {EMERGENCY_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </Select>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">GPS Location (Auto-Detected)</label>
          <div className="flex gap-2">
            <div className={`flex-1 rounded-xl border px-4 py-2.5 text-sm flex items-center gap-2 font-medium ${
              geo.coords
                ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                : 'border-slate-300 bg-slate-50 text-slate-700'
            }`}>
              <MapPin size={15} className={geo.coords ? 'text-emerald-600' : 'text-slate-400'} />
              {geo.loading ? (
                <span className="text-slate-600 flex items-center gap-1.5">
                  <Loader2 size={14} className="animate-spin text-orange-500" /> Auto-detecting GPS location…
                </span>
              ) : geo.coords ? (
                <span className="font-semibold">{geo.coords.lat.toFixed(5)}, {geo.coords.lng.toFixed(5)}</span>
              ) : geo.error ? (
                <span className="text-red-500 text-xs font-semibold">{geo.error}</span>
              ) : (
                'Not detected'
              )}
            </div>
            <Button type="button" variant="outline" size="md" loading={geo.loading} onClick={geo.request}>
              <MapPin size={14} />
              Re-Detect
            </Button>
          </div>
        </div>

        <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Mic size={14} className="text-orange-500" />
              1-Minute Voice Note (Optional)
            </label>
            <span className="text-xs font-mono font-bold text-slate-500">
              00:{recordingTime < 10 ? `0${recordingTime}` : recordingTime} / 01:00
            </span>
          </div>

          {!audioUrl ? (
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-slate-500 font-medium">Record a quick distress audio message up to 60s</p>
              {!recording ? (
                <button
                  type="button"
                  onClick={startRecording}
                  className="px-3.5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-orange-500/20 transition-all cursor-pointer"
                >
                  <Mic size={14} />
                  Record Voice
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopRecording}
                  className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-red-500/20 animate-pulse cursor-pointer"
                >
                  <Square size={13} />
                  Stop (00:{recordingTime < 10 ? `0${recordingTime}` : recordingTime})
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={toggleAudioPlay}
                className="h-8 w-8 rounded-lg bg-orange-50 border border-orange-200 text-orange-600 flex items-center justify-center hover:bg-orange-100 transition-colors"
              >
                {isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-800 flex items-center gap-1">
                  <Volume2 size={12} className="text-orange-500" /> Voice Message Recorded
                </p>
                <p className="text-[10px] text-slate-500 font-medium">{recordingTime} seconds recorded</p>
              </div>
              <audio
                ref={audioPlayerRef}
                src={audioUrl}
                onEnded={() => setIsPlaying(false)}
                className="hidden"
              />
              <button
                type="button"
                onClick={deleteRecording}
                className="h-8 w-8 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors flex items-center justify-center"
                title="Delete voice note"
              >
                <Trash2 size={14} />
              </button>
            </div>
          )}
        </div>

        <Textarea
          label="Description (Optional)"
          placeholder="Describe the emergency — number of trapped people, conditions, urgent needs…"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Disaster Photo (Optional)</label>
          <label className="relative block cursor-pointer group">
            <input type="file" accept="image/*" onChange={handleImage} className="sr-only" />
            {imagePreview ? (
              <div className="relative rounded-xl overflow-hidden h-36 border border-slate-200 shadow-xs">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <p className="text-white text-xs font-bold">Click to replace photo</p>
                </div>
              </div>
            ) : (
              <div className="h-24 rounded-xl border-2 border-dashed border-slate-300 group-hover:border-orange-500 transition-colors flex flex-col items-center justify-center gap-1.5 bg-white shadow-xs">
                <Camera size={20} className="text-slate-400 group-hover:text-orange-500 transition-colors" />
                <span className="text-xs font-semibold text-slate-600 group-hover:text-slate-900">Click to upload photo</span>
              </div>
            )}
          </label>
        </div>

        <AnimatePresence>
          {submitting && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-xl bg-orange-50 border border-orange-200 p-4 space-y-2"
            >
              {steps.map((step, i) => {
                const currentIdx = steps.findIndex((s) => s.key === aiStep)
                const isDone   = i < currentIdx || aiStep === 'done'
                const isActive = step.key === aiStep
                return (
                  <div key={step.key} className={`flex items-center gap-2.5 text-xs font-semibold transition-colors ${
                    isActive ? 'text-orange-800 font-bold' : isDone ? 'text-emerald-700' : 'text-slate-400'
                  }`}>
                    {isDone    ? <CheckCircle size={14} className="text-emerald-600" /> :
                     isActive  ? <Loader2 size={14} className="animate-spin text-orange-600" /> :
                                 <div className="h-3.5 w-3.5 rounded-full border border-slate-300" />}
                    {step.label}
                  </div>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {!submitting && (
          <Button type="submit" size="lg" className="w-full shadow-lg shadow-orange-500/25">
            <AlertTriangle size={18} />
            Submit Emergency SOS
          </Button>
        )}
      </form>
    </Card>
  )
}

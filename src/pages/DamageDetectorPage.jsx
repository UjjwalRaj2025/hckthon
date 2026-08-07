import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, Upload, Loader2, X, Sparkles, AlertTriangle } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { DamageResultCard } from '../components/ai/DamageResultCard'
import { analyzeDamageImage } from '../services/geminiService'
import { useToast } from '../context/ToastContext'

export default function DamageDetectorPage() {
  const { push }    = useToast()
  const inputRef    = useRef(null)
  const [file,      setFile]      = useState(null)
  const [preview,   setPreview]   = useState(null)
  const [result,    setResult]    = useState(null)
  const [loading,   setLoading]   = useState(false)
  const [drag,      setDrag]      = useState(false)

  const handleFile = (f) => {
    if (!f || !f.type.startsWith('image/')) {
      push('Please select a valid image file', 'warning')
      return
    }
    setFile(f)
    setResult(null)
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target.result)
    reader.readAsDataURL(f)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDrag(false)
    const f = e.dataTransfer.files?.[0]
    if (f) handleFile(f)
  }

  const handleAnalyze = async () => {
    if (!file) return push('Please upload an image first', 'warning')
    setLoading(true)
    try {
      const data = await analyzeDamageImage(file)
      setResult(data)
      push('✅ AI Damage analysis complete', 'success')
    } catch (err) {
      push(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setFile(null)
    setPreview(null)
    setResult(null)
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 bg-slate-50 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-200 bg-purple-50 text-xs font-bold text-purple-700 uppercase tracking-wider"
          >
            <Sparkles size={13} />
            Multimodal Vision AI
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-extrabold text-slate-900 tracking-tight"
          >
            AI Disaster Damage Detection
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-slate-600 max-w-xl mx-auto font-medium text-sm"
          >
            Upload a disaster photograph and Vision AI will analyze damage type, severity, potential hazards, and recommended emergency actions.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Left — Upload Box */}
          <div className="space-y-4">
            {/* Drop zone */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              onDragOver={(e) => { e.preventDefault(); setDrag(true)  }}
              onDragLeave={() => setDrag(false)}
              onDrop={handleDrop}
              className={`relative rounded-2xl border-2 border-dashed transition-all duration-200 overflow-hidden cursor-pointer shadow-xs
                ${drag
                  ? 'border-purple-500 bg-purple-50'
                  : preview
                  ? 'border-slate-300 bg-white'
                  : 'border-slate-300 bg-white hover:border-purple-400 hover:bg-purple-50/50'
                }`}
              onClick={() => !preview && inputRef.current?.click()}
            >
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />

              <AnimatePresence mode="wait">
                {preview ? (
                  <motion.div
                    key="preview"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="relative"
                  >
                    <img
                      src={preview}
                      alt="Upload preview"
                      className="w-full max-h-80 object-cover"
                    />
                    {/* Overlay actions */}
                    <div className="absolute inset-0 bg-slate-900/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); inputRef.current?.click() }}
                        className="px-4 py-2 rounded-xl bg-white text-slate-900 text-xs font-bold border border-slate-200 hover:bg-slate-100 transition-colors shadow-md"
                      >
                        <Upload size={14} className="inline mr-1.5" />
                        Replace
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); reset() }}
                        className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors shadow-md"
                      >
                        <X size={14} className="inline mr-1.5" />
                        Remove
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="dropzone"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-16 px-6 gap-4"
                  >
                    <div className="h-16 w-16 rounded-2xl bg-purple-100 border border-purple-200 flex items-center justify-center">
                      <Camera size={28} className="text-purple-600" />
                    </div>
                    <div className="text-center">
                      <p className="text-slate-900 font-extrabold text-sm mb-1">Drop disaster photo here or click to browse</p>
                      <p className="text-xs text-slate-500 font-medium">Supports JPG, PNG, WEBP — up to 20MB</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Filename */}
            {file && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 shadow-xs"
              >
                <Camera size={14} className="text-purple-600" />
                <span className="text-xs text-slate-700 font-bold truncate flex-1">{file.name}</span>
                <span className="text-xs text-slate-500 font-semibold">{(file.size / 1024 / 1024).toFixed(1)} MB</span>
              </motion.div>
            )}

            {/* Analyze button */}
            <Button
              size="lg"
              variant={file ? 'primary' : 'outline'}
              className="w-full shadow-lg shadow-orange-500/20"
              loading={loading}
              disabled={!file || loading}
              onClick={handleAnalyze}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Multimodal Vision AI Analyzing…
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Analyze Disaster Damage
                </>
              )}
            </Button>

            {/* Detectable types */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2 shadow-xs">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Detectable Disaster Types</p>
              <div className="flex flex-wrap gap-1.5">
                {['Building Collapse', 'Flood Damage', 'Fire', 'Landslide', 'Earthquake', 'Road Damage'].map((t) => (
                  <span key={t} className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700">{t}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Right — Result Container */}
          <div>
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex flex-col items-center justify-center gap-6 py-16 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center"
                >
                  <div className="relative">
                    <div className="h-20 w-20 rounded-full border-2 border-purple-200 flex items-center justify-center bg-purple-50">
                      <Sparkles size={32} className="text-purple-600 animate-pulse" />
                    </div>
                    <div className="absolute inset-0 rounded-full border-t-2 border-purple-600 animate-spin" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-slate-900 font-extrabold text-base">Multimodal AI Analyzing Photo…</p>
                    <p className="text-slate-500 text-xs font-medium">Extracting structural damage, hazard risks & urgency</p>
                  </div>
                  <div className="w-56 space-y-2 text-left bg-slate-50 p-3 rounded-xl border border-slate-200">
                    {['Detecting structural damage…', 'Assessing severity level…', 'Identifying immediate hazards…'].map((step, i) => (
                      <motion.p
                        key={step}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.7 }}
                        className="text-xs text-slate-700 font-semibold flex items-center gap-2"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-purple-600 animate-pulse" />
                        {step}
                      </motion.p>
                    ))}
                  </div>
                </motion.div>
              ) : result ? (
                <motion.div key="result">
                  <DamageResultCard result={result} />
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex flex-col items-center justify-center gap-4 py-20 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center"
                >
                  <div className="h-16 w-16 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center">
                    <AlertTriangle size={24} className="text-purple-600" />
                  </div>
                  <p className="text-slate-600 text-sm max-w-xs font-medium">
                    Upload a disaster photograph and click <span className="text-slate-900 font-bold">Analyze Disaster Damage</span> to generate AI report
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}

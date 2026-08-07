import { SignIn, SignUp } from '@clerk/clerk-react'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Shield } from 'lucide-react'

export default function AuthPage() {
  const [mode, setMode] = useState('signin') // 'signin' | 'signup'

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20 bg-slate-50 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full flex flex-col items-center max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 shadow-lg shadow-orange-500/25 mb-3">
            <Shield size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">ResQAI</h1>
          <p className="text-slate-500 text-sm mt-0.5 font-medium">Real-time AI Disaster Response System</p>
        </div>

        {/* Mode switcher */}
        <div className="flex rounded-xl bg-slate-200/70 p-1 mb-6 gap-1 w-full max-w-xs border border-slate-300/60">
          <button
            onClick={() => setMode('signin')}
            className={`flex-1 py-1.5 text-sm font-semibold rounded-lg transition-all ${
              mode === 'signin'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setMode('signup')}
            className={`flex-1 py-1.5 text-sm font-semibold rounded-lg transition-all ${
              mode === 'signup'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Register
          </button>
        </div>

        {/* Real Clerk Auth UI */}
        <div className="w-full flex justify-center shadow-xl rounded-2xl overflow-hidden border border-slate-200">
          {mode === 'signin' ? (
            <SignIn
              routing="path"
              path="/auth"
              signUpUrl="/auth"
              afterSignInUrl="/"
              appearance={{
                variables: {
                  colorPrimary: '#F97316',
                  colorBackground: '#FFFFFF',
                  colorText: '#0F172A',
                  borderRadius: '16px',
                },
                elements: {
                  card: 'bg-white shadow-none border-0',
                  formButtonPrimary: 'bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-xl',
                  footerActionLink: 'text-orange-600 font-semibold hover:text-orange-700',
                },
              }}
            />
          ) : (
            <SignUp
              routing="path"
              path="/auth"
              signInUrl="/auth"
              afterSignUpUrl="/"
              appearance={{
                variables: {
                  colorPrimary: '#F97316',
                  colorBackground: '#FFFFFF',
                  colorText: '#0F172A',
                  borderRadius: '16px',
                },
                elements: {
                  card: 'bg-white shadow-none border-0',
                  formButtonPrimary: 'bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-xl',
                  footerActionLink: 'text-orange-600 font-semibold hover:text-orange-700',
                },
              }}
            />
          )}
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          Secured by <strong>Clerk Authentication</strong>
        </p>
      </motion.div>
    </div>
  )
}

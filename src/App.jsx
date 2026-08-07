import { Component, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ClerkProvider } from '@clerk/clerk-react'
import { Navbar } from './components/layout/Navbar'
import { ToastContainer } from './components/ui/Toast'
import { BroadcastAlertModal } from './components/alerts/BroadcastAlertModal'
import { Spinner } from './components/ui/Spinner'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider } from './context/ToastContext'


const rawKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || ''
const CLERK_KEY = rawKey.trim()

// Lazy-loaded pages — SOS is Home!
const SOSPage            = lazy(() => import('./pages/SOSPage'))
const DashboardPage      = lazy(() => import('./pages/DashboardPage'))
const DamageDetectorPage = lazy(() => import('./pages/DamageDetectorPage'))
const AboutPage          = lazy(() => import('./pages/LandingPage')) // About ResQAI / How it works
const AuthPage           = lazy(() => import('./pages/AuthPage'))

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <Spinner size="xl" />
  </div>
)

// Error Boundary to prevent blank white screen on invalid Clerk key
class ClerkErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Clerk Auth Error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      const isClerkErr = this.state.error?.message?.includes('Clerk') || this.state.error?.message?.includes('publishableKey')
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
          <div className="max-w-lg w-full p-8 bg-white rounded-2xl border border-red-200 shadow-2xl text-center space-y-4">
            <div className="h-14 w-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto text-2xl font-bold">
              ⚠️
            </div>
            <h2 className="text-xl font-extrabold text-slate-900">
              {isClerkErr ? 'Invalid Clerk API Key' : 'Application Render Error'}
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed font-mono text-xs bg-slate-100 p-3 rounded-xl">
              {this.state.error?.message || 'An error occurred while loading this page.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-xl bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-600/20 cursor-pointer"
            >
              Reload Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default function App() {
  if (!CLERK_KEY) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md w-full p-6 bg-white rounded-2xl border border-red-200 shadow-xl text-center space-y-3">
          <div className="h-12 w-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto text-xl font-bold">⚠️</div>
          <h2 className="text-lg font-bold text-slate-900">Clerk Publishable Key Missing</h2>
          <p className="text-sm text-slate-600">
            Please add your <code>VITE_CLERK_PUBLISHABLE_KEY</code> in <code>.env</code> file to enable real user authentication.
          </p>
        </div>
      </div>
    )
  }

  return (
    <ClerkErrorBoundary>
      <ClerkProvider publishableKey={CLERK_KEY} fallbackRedirectUrl="/">
        <BrowserRouter>
          <ThemeProvider>
            <AuthProvider>
              <ToastProvider>
                <div className="min-h-screen bg-slate-50 text-slate-900 antialiased font-sans">
                  <Navbar />
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                      <Route path="/"          element={<SOSPage />}            />
                      <Route path="/sos"       element={<SOSPage />}            />
                      <Route path="/dashboard" element={<DashboardPage />}      />
                      <Route path="/damage"    element={<DamageDetectorPage />} />
                      <Route path="/about"     element={<AboutPage />}          />
                      <Route path="/auth/*"    element={<AuthPage />}           />
                      <Route path="*"          element={<Navigate to="/" replace />} />
                    </Routes>
                  </Suspense>
                  <ToastContainer />
                  <BroadcastAlertModal />
                </div>
              </ToastProvider>
            </AuthProvider>
          </ThemeProvider>
        </BrowserRouter>
      </ClerkProvider>
    </ClerkErrorBoundary>
  )
}

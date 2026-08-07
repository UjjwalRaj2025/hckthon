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


const CLERK_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

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
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
          <div className="max-w-lg w-full p-8 bg-white rounded-2xl border border-red-200 shadow-2xl text-center space-y-4">
            <div className="h-14 w-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto text-2xl font-bold">
              🔑
            </div>
            <h2 className="text-xl font-extrabold text-slate-900">Invalid Clerk API Key</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Clerk responded with an authentication error (401 Unauthorized). The <code>VITE_CLERK_PUBLISHABLE_KEY</code> in your <code>.env</code> file is invalid or incomplete.
            </p>
            <div className="bg-slate-100 p-3 rounded-xl text-xs font-mono text-slate-700 text-left overflow-x-auto">
              Current Key: {CLERK_KEY ? CLERK_KEY.slice(0, 20) + '...' : 'None'}
            </div>
            <p className="text-xs text-slate-500">
              Go to <a href="https://dashboard.clerk.com" target="_blank" rel="noreferrer" className="text-orange-600 font-semibold underline">dashboard.clerk.com</a> &rarr; API Keys &rarr; Copy Publishable Key to <code>.env</code> and restart the server.
            </p>
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
      <ClerkProvider publishableKey={CLERK_KEY} afterSignInUrl="/" afterSignUpUrl="/">
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

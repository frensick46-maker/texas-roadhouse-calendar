import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './auth/AuthContext'
import { AuthPage } from './pages/AuthPage'
import { DashboardPage } from './pages/DashboardPage'
import { Layout } from './components/Layout'
import './App.css'

function App() {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="fullpage-center">
        <div className="spinner" />
        <p>Loading your session…</p>
      </div>
    )
  }

  return (
    <Routes>
      <Route
        path="/auth"
        element={session ? <Navigate to="/" replace /> : <AuthPage />}
      />
      <Route
        path="/"
        element={
          session ? (
            <Layout>
              <DashboardPage />
            </Layout>
          ) : (
            <Navigate to="/auth" replace />
          )
        }
      />
      <Route
        path="*"
        element={<Navigate to={session ? '/' : '/auth'} replace />}
      />
    </Routes>
  )
}

export default App

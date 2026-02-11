import { FormEvent, useState } from 'react'
import { useAuth } from '../auth/AuthContext'

type Mode = 'signin' | 'signup'

export function AuthPage() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      if (mode === 'signin') {
        await signIn(email, password)
      } else {
        await signUp(email, password)
      }
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="app-title">Team Calendar &amp; Todos</h1>
        <p className="app-subtitle">Sign in to start sharing events and task lists.</p>

        <div className="auth-toggle">
          <button
            type="button"
            className={mode === 'signin' ? 'auth-toggle-button active' : 'auth-toggle-button'}
            onClick={() => setMode('signin')}
          >
            Sign in
          </button>
          <button
            type="button"
            className={mode === 'signup' ? 'auth-toggle-button active' : 'auth-toggle-button'}
            onClick={() => setMode('signup')}
          >
            Create account
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              placeholder="you@company.com"
            />
          </label>

          <label className="field">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={6}
              placeholder="At least 6 characters"
            />
          </label>

          {error ? <p className="form-error">{error}</p> : null}

          <button type="submit" className="primary-button" disabled={submitting}>
            {submitting ? 'Working...' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  )
}


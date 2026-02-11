import type { ReactNode } from 'react'
import { useAuth } from '../auth/AuthContext'

type LayoutProps = {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  const { session, signOut } = useAuth()
  const email = session?.user.email ?? 'Unknown user'

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to sign out', error)
    }
  }

  return (
    <div className="app-shell">
      <div className="app-topbar">
        <div className="user-email" title={email}>
          {email}
        </div>
        <button
          type="button"
          className="secondary-button app-topbar-signout"
          onClick={() => void handleSignOut()}
        >
          Sign out
        </button>
      </div>
      <header className="app-header">
        <div className="app-header-main">
          <div className="app-header-brand">
            <div className="app-header-title">Texas Roadhouse La Plata 297</div>
            <div className="app-header-subtitle">Shift calendar, store events, and team tasks</div>
          </div>
        </div>
      </header>
      <main className="app-main">{children}</main>
      <footer className="app-footer">
        <span className="app-footer-build">Updated Feb 10, 2025</span>
      </footer>
    </div>
  )
}


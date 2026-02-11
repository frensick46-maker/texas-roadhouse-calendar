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
      <div className="app-legend" aria-hidden="true">
        <div className="app-legend-item">
          <span className="legend-swatch legend-swatch--lsm" />
          <span>LSM event</span>
        </div>
        <div className="app-legend-item">
          <span className="legend-swatch legend-swatch--boh" />
          <span>BOH</span>
        </div>
        <div className="app-legend-item">
          <span className="legend-swatch legend-swatch--foh" />
          <span>FOH</span>
        </div>
        <div className="app-legend-item">
          <span className="legend-swatch legend-swatch--visitor" />
          <span>Visitor</span>
        </div>
        <div className="app-legend-item">
          <span className="legend-swatch legend-swatch--holiday" />
          <span>Holiday</span>
        </div>
        <div className="app-legend-item">
          <span className="legend-swatch legend-swatch--birthday" />
          <span>Birthday / Anniversary</span>
        </div>
      </div>
      <header className="app-header">
        <div className="app-header-main">
          <div className="app-header-brand">
            <div className="app-header-title">Texas Roadhouse La Plata 297</div>
            <div className="app-header-subtitle">Shift calendar, store events, and team tasks</div>
          </div>
        </div>
      </header>
      <div className="app-legend-mobile" aria-label="Event type legend">
        <div className="app-legend-mobile-inner">
          <span className="app-legend-mobile-label">Legend:</span>
          <span className="legend-swatch legend-swatch--lsm" />
          <span>LSM</span>
          <span className="legend-swatch legend-swatch--boh" />
          <span>BOH</span>
          <span className="legend-swatch legend-swatch--foh" />
          <span>FOH</span>
          <span className="legend-swatch legend-swatch--visitor" />
          <span>Visitor</span>
          <span className="legend-swatch legend-swatch--holiday" />
          <span>Holiday</span>
          <span className="legend-swatch legend-swatch--birthday" />
          <span>Bday</span>
        </div>
      </div>
      <main className="app-main">{children}</main>
    </div>
  )
}


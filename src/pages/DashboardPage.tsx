import { useState } from 'react'
import { Calendar2026 } from '../components/Calendar2026'

export function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'calendar' | 'todos'>('calendar')

  return (
    <div className="dashboard">
      <div className="dashboard-tabs">
        <button
          type="button"
          className={
            activeTab === 'calendar'
              ? 'dashboard-tab dashboard-tab--active'
              : 'dashboard-tab'
          }
          onClick={() => setActiveTab('calendar')}
        >
          Calendar
        </button>
        <button
          type="button"
          className={
            activeTab === 'todos'
              ? 'dashboard-tab dashboard-tab--active'
              : 'dashboard-tab'
          }
          onClick={() => setActiveTab('todos')}
        >
          Team todos
        </button>
      </div>

      {activeTab === 'calendar' ? (
        <section className="panel">
          <h2 className="panel-title">Team calendar</h2>
          <Calendar2026 />
        </section>
      ) : (
        <section className="panel">
          <h2 className="panel-title">Team todo lists</h2>
          <p className="panel-description">
            This will host different todo lists for different sections of your team.
          </p>
          <ul className="placeholder-list">
            <li>• LSM / marketing tasks</li>
            <li>• BOH / prep and line tasks</li>
            <li>• FOH / service and hosts</li>
          </ul>
          <div className="placeholder-box">Shared todo lists coming soon.</div>
        </section>
      )}
    </div>
  )
}


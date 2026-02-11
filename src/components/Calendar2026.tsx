import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { supabase } from '../lib/supabaseClient'

type Holiday = {
  date: string // YYYY-MM-DD
  name: string
}

const HOLIDAYS_2026: Holiday[] = [
  // New Year period
  { date: '2026-01-01', name: 'New Year’s Day' },

  // Winter & spring
  { date: '2026-01-19', name: 'Martin Luther King Jr. Day' },
  { date: '2026-02-14', name: "Valentine's Day" },
  { date: '2026-02-16', name: 'Presidents’ Day' },
  { date: '2026-03-17', name: "St. Patrick's Day" },
  { date: '2026-04-05', name: 'Easter Sunday' },

  // Late spring & summer
  { date: '2026-05-10', name: "Mother's Day" },
  { date: '2026-05-25', name: 'Memorial Day' },
  { date: '2026-06-21', name: "Father's Day" },
  { date: '2026-07-03', name: 'Independence Day (Observed)' },
  { date: '2026-07-04', name: 'Independence Day' },

  // Fall & winter
  { date: '2026-09-07', name: 'Labor Day' },
  { date: '2026-10-12', name: 'Columbus Day' },
  { date: '2026-10-31', name: 'Halloween' },
  { date: '2026-11-11', name: 'Veterans Day' },
  { date: '2026-11-26', name: 'Thanksgiving Day' },
  { date: '2026-12-25', name: 'Christmas Day' },
  { date: '2026-12-31', name: 'New Year’s Eve' },
]

const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const monthLabels = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

function getMonthMatrix(year: number, monthIndex: number) {
  const firstOfMonth = new Date(year, monthIndex, 1)
  const startWeekday = firstOfMonth.getDay() // 0-6, Sun-Sat
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()

  const weeks: Array<Array<number | null>> = []
  let currentDay = 1 - startWeekday

  while (currentDay <= daysInMonth) {
    const week: Array<number | null> = []
    for (let i = 0; i < 7; i += 1) {
      if (currentDay < 1 || currentDay > daysInMonth) {
        week.push(null)
      } else {
        week.push(currentDay)
      }
      currentDay += 1
    }
    weeks.push(week)
  }

  return weeks
}

const holidaysByDate = HOLIDAYS_2026.reduce<Record<string, Holiday[]>>((acc, holiday) => {
  if (!acc[holiday.date]) {
    acc[holiday.date] = []
  }
  acc[holiday.date]!.push(holiday)
  return acc
}, {})

type EventType = 'lsm' | 'boh' | 'foh' | 'visitor' | 'holiday' | 'birthday'

type CalendarEvent = {
  id: string
  date: string // YYYY-MM-DD
  title: string
  description?: string
  type: EventType
}

const EVENT_TYPE_LABELS: Record<EventType, string> = {
  lsm: 'LSM event',
  boh: 'BOH',
  foh: 'FOH',
  visitor: 'Visitor',
  holiday: 'Holiday',
  birthday: 'Birthday / Anniversary',
}

export function Calendar2026() {
  const { session } = useAuth()
  const year = 2026
  const today = new Date()
  const isToday2026 = today.getFullYear() === year
  const initialMonthIndex = isToday2026 ? today.getMonth() : 0
  const [monthIndex, setMonthIndex] = useState(initialMonthIndex)

  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [eventsLoading, setEventsLoading] = useState(true)
  const [newTitle, setNewTitle] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newType, setNewType] = useState<EventType>('lsm')
  const [eventIdPendingDelete, setEventIdPendingDelete] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setEventsLoading(true)
      const { data, error } = await supabase
        .from('events')
        .select('id, date, title, description, type')
        .gte('date', '2026-01-01')
        .lte('date', '2026-12-31')
        .order('date', { ascending: true })
      if (error) {
        // Table might not exist yet
        console.error('Failed to load events:', error.message)
        setEvents([])
      } else {
        setEvents(
          (data ?? []).map((row) => ({
            id: row.id,
            date: row.date,
            title: row.title,
            description: row.description ?? undefined,
            type: row.type as EventType,
          })),
        )
      }
      setEventsLoading(false)
    }
    void load()
  }, [])

  const selectedHolidays = useMemo(
    () => (selectedDate ? holidaysByDate[selectedDate] ?? [] : []),
    [selectedDate],
  )

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>()
    for (const ev of events) {
      const list = map.get(ev.date)
      if (!list) {
        map.set(ev.date, [ev])
      } else {
        list.push(ev)
      }
    }
    return map
  }, [events])

  const selectedEvents = useMemo(
    () => (selectedDate ? eventsByDate.get(selectedDate) ?? [] : []),
    [eventsByDate, selectedDate],
  )

  const upcomingEventsThisWeek = useMemo(() => {
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    const end = new Date(start)
    // Next 7 days INCLUDING today -> today + 6
    end.setDate(start.getDate() + 6)

    const withinRange = (dateString: string) => {
      const [y, m, d] = dateString.split('-').map(Number)
      const dt = new Date(y, m - 1, d)
      return dt >= start && dt <= end
    }

    const items: Array<{ kind: 'event'; ev: CalendarEvent } | { kind: 'holiday'; holiday: Holiday }> = []

    for (const ev of events) {
      if (withinRange(ev.date)) {
        items.push({ kind: 'event', ev })
      }
    }

    for (const holiday of HOLIDAYS_2026) {
      if (withinRange(holiday.date)) {
        items.push({ kind: 'holiday', holiday })
      }
    }

    items.sort((a, b) => {
      const aDate = a.kind === 'event' ? a.ev.date : a.holiday.date
      const bDate = b.kind === 'event' ? b.ev.date : b.holiday.date
      return aDate.localeCompare(bDate)
    })

    return items
  }, [events])

  const handleAddEvent = async () => {
    if (!selectedDate || !newTitle.trim()) return
    const { data, error } = await supabase
      .from('events')
      .insert({
        date: selectedDate,
        title: newTitle.trim(),
        description: newDescription.trim() || null,
        type: newType,
        created_by: session?.user?.id ?? null,
      })
      .select('id, date, title, description, type')
      .single()
    if (error) {
      console.error('Failed to add event:', error.message)
      return
    }
    setEvents((prev) => [
      ...prev,
      {
        id: data.id,
        date: data.date,
        title: data.title,
        description: data.description ?? undefined,
        type: data.type as EventType,
      },
    ])
    setNewTitle('')
    setNewDescription('')
    setNewType('lsm')
  }

  const handleConfirmRemoveEvent = async () => {
    if (!eventIdPendingDelete) return
    const { error } = await supabase.from('events').delete().eq('id', eventIdPendingDelete)
    if (error) {
      console.error('Failed to remove event:', error.message)
      return
    }
    setEvents((prev) => prev.filter((ev) => ev.id !== eventIdPendingDelete))
    setEventIdPendingDelete(null)
  }

  const handlePrevMonth = () => {
    setMonthIndex((prev) => (prev === 0 ? 11 : prev - 1))
    setSelectedDate(null)
  }

  const handleNextMonth = () => {
    setMonthIndex((prev) => (prev === 11 ? 0 : prev + 1))
    setSelectedDate(null)
  }

  return (
    <div className="calendar">
      <div className="calendar-color-key" role="region" aria-label="Event color key">
        <span className="calendar-color-key-label">Color key</span>
        <div className="calendar-color-key-items">
          <div className="calendar-color-key-item">
            <span className="legend-swatch legend-swatch--lsm" />
            <span>LSM</span>
          </div>
          <div className="calendar-color-key-item">
            <span className="legend-swatch legend-swatch--boh" />
            <span>BOH</span>
          </div>
          <div className="calendar-color-key-item">
            <span className="legend-swatch legend-swatch--foh" />
            <span>FOH</span>
          </div>
          <div className="calendar-color-key-item">
            <span className="legend-swatch legend-swatch--visitor" />
            <span>Visitor</span>
          </div>
          <div className="calendar-color-key-item">
            <span className="legend-swatch legend-swatch--holiday" />
            <span>Holiday</span>
          </div>
          <div className="calendar-color-key-item">
            <span className="legend-swatch legend-swatch--birthday" />
            <span>Bday</span>
          </div>
        </div>
      </div>
      <div className="calendar-header">
        <div>
          <div className="calendar-title">Year overview – 2026</div>
          <div className="calendar-subtitle">
            U.S. federal holidays are highlighted in the calendar and listed below.
          </div>
          {eventsLoading && (
            <div className="calendar-loading" aria-live="polite">
              Loading shared events…
            </div>
          )}
        </div>
        <div className="calendar-month-controls">
          <button
            type="button"
            className="calendar-nav-button"
            onClick={handlePrevMonth}
            aria-label="Previous month"
          >
            ‹
          </button>
          <div className="calendar-month-badge">
            <span className="calendar-month-name">{monthLabels[monthIndex]}</span>
            <span className="calendar-year-label">{year}</span>
          </div>
          <button
            type="button"
            className="calendar-nav-button"
            onClick={handleNextMonth}
            aria-label="Next month"
          >
            ›
          </button>
        </div>
      </div>

      <div className="calendar-weekday-header">
        {weekdayLabels.map((label) => (
          <div key={label} className="calendar-weekday-header-cell">
            {label.substring(0, 1)}
          </div>
        ))}
      </div>

      <div className="calendar-grid">
        {getMonthMatrix(year, monthIndex).map((week, weekIndex) => (
          <div key={weekIndex} className="calendar-week-row">
            {week.map((day, dayIndex) => {
              const dateString =
                day == null
                  ? null
                  : `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
              const holidaysForDay = dateString ? holidaysByDate[dateString] : undefined
              const eventsForDay = dateString ? eventsByDate.get(dateString) : undefined

              const isToday =
                isToday2026 &&
                day != null &&
                today.getDate() === day &&
                today.getMonth() === monthIndex

              const isSelected = selectedDate === dateString

              const hasEvents = eventsForDay && eventsForDay.length > 0

              return (
                <div
                  key={dayIndex}
                  className={
                    holidaysForDay && holidaysForDay.length > 0
                      ? 'calendar-cell holiday'
                      : hasEvents
                        ? 'calendar-cell event'
                        : isToday
                          ? 'calendar-cell today'
                          : isSelected
                            ? 'calendar-cell selected'
                            : 'calendar-cell'
                  }
                  onClick={() => {
                    if (!dateString || day == null) return
                    setSelectedDate((prev) => (prev === dateString ? null : dateString))
                  }}
                >
                  {day != null ? (
                    <>
                      <div className="calendar-day-number">{day}</div>
                      <div className="calendar-weekday-label" />
                      {holidaysForDay && holidaysForDay.length > 0 ? (
                        <div
                          className="calendar-holiday-dot"
                          title={holidaysForDay.map((h) => h.name).join(', ')}
                        />
                      ) : null}
                      {eventsForDay && eventsForDay.length > 0 ? (
                        <div className="calendar-event-dots">
                          {eventsForDay.slice(0, 4).map((ev) => (
                            <span
                              key={ev.id}
                              className={`calendar-event-dot calendar-event-dot--${ev.type}`}
                            />
                          ))}
                        </div>
                      ) : null}
                    </>
                  ) : null}
                </div>
              )
            })}
          </div>
        ))}
      </div>

      <div className="calendar-holiday-list">
        <div className="calendar-holiday-list-title">
          {selectedDate
            ? (() => {
                const [y, m, d] = selectedDate.split('-').map(Number)
                const displayDate = new Date(y, m - 1, d)
                return `Details for ${displayDate.toLocaleDateString(undefined, {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}`
              })()
            : 'Click a day to see holidays and events'}
        </div>
        {selectedDate ? (
          <>
            <ul>
              {selectedHolidays.length > 0 ? (
                selectedHolidays.map((holiday) => (
                  <li key={holiday.date}>
                    <span className="calendar-holiday-date">
                      {(() => {
                        const [y, m, d] = holiday.date.split('-').map(Number)
                        const displayDate = new Date(y, m - 1, d)
                        return displayDate.toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          weekday: 'short',
                        })
                      })()}
                    </span>
                    <span className="calendar-holiday-name">{holiday.name}</span>
                  </li>
                ))
              ) : (
                <li>
                  <span className="calendar-holiday-name">No major holidays on this day.</span>
                </li>
              )}
            </ul>
            <div className="calendar-holiday-subtext">
              Team events will appear here in the future.
            </div>
            <div className="calendar-events-section">
              <div className="calendar-events-title">Events on this day</div>
              {selectedEvents.length > 0 ? (
                <ul className="calendar-events-list">
                  {selectedEvents.map((ev) => (
                    <li key={ev.id} className={`calendar-event-chip calendar-event-chip--${ev.type}`}>
                      <div className="calendar-event-chip-header">
                        <span className="calendar-event-chip-title">{ev.title}</span>
                        <span className="calendar-event-chip-tag">
                          {EVENT_TYPE_LABELS[ev.type]}
                        </span>
                        <button
                          type="button"
                          className="calendar-event-chip-remove"
                          onClick={() => setEventIdPendingDelete(ev.id)}
                          aria-label="Remove event"
                        >
                          ×
                        </button>
                      </div>
                      {ev.description ? (
                        <div className="calendar-event-chip-description">{ev.description}</div>
                      ) : null}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="calendar-events-empty">No events yet for this day.</p>
              )}
              <div className="calendar-event-form">
                <div className="calendar-event-form-row">
                  <input
                    className="calendar-event-input"
                    type="text"
                    placeholder="Event title (e.g. LSM promo, FOH meeting)"
                    value={newTitle}
                    onChange={(event) => setNewTitle(event.target.value)}
                  />
                  <select
                    className="calendar-event-select"
                    value={newType}
                    onChange={(event) => setNewType(event.target.value as EventType)}
                  >
                    <option value="lsm">LSM event</option>
                    <option value="boh">BOH</option>
                    <option value="foh">FOH</option>
                    <option value="visitor">Visitor</option>
                    <option value="holiday">Holiday</option>
                    <option value="birthday">Birthday / Anniversary</option>
                  </select>
                </div>
                <textarea
                  className="calendar-event-textarea"
                  placeholder="Optional description (who, what, timing, notes)"
                  value={newDescription}
                  onChange={(event) => setNewDescription(event.target.value)}
                  rows={2}
                />
                <button
                  type="button"
                  className="primary-button calendar-event-submit"
                  onClick={handleAddEvent}
                  disabled={!newTitle.trim() || !selectedDate}
                >
                  Add event
                </button>
              </div>
            </div>
          </>
        ) : null}
        {upcomingEventsThisWeek.length > 0 ? (
          <div className="calendar-upcoming">
            <div className="calendar-upcoming-title">This week&apos;s events</div>
            <ul className="calendar-upcoming-list">
              {upcomingEventsThisWeek.map((item, index) => {
                if (item.kind === 'event') {
                  const ev = item.ev
                  const [y, m, d] = ev.date.split('-').map(Number)
                  const displayDate = new Date(y, m - 1, d)
                  return (
                    <li
                      key={`ev-${ev.id}-${index}`}
                      className={`calendar-upcoming-item calendar-upcoming-item--${ev.type}`}
                    >
                      <span className="calendar-upcoming-date">
                        {displayDate.toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          weekday: 'short',
                        })}
                      </span>
                      <span
                        className={`calendar-upcoming-dot calendar-event-dot calendar-event-dot--${ev.type}`}
                      />
                      <span className="calendar-upcoming-text">
                        {ev.title}
                        {ev.type ? ` · ${EVENT_TYPE_LABELS[ev.type]}` : ''}
                      </span>
                    </li>
                  )
                }

                const holiday = item.holiday
                const [y, m, d] = holiday.date.split('-').map(Number)
                const displayDate = new Date(y, m - 1, d)

                return (
                  <li
                    key={`holiday-${holiday.date}-${index}`}
                    className="calendar-upcoming-item calendar-upcoming-item--holiday"
                  >
                    <span className="calendar-upcoming-date">
                      {displayDate.toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        weekday: 'short',
                      })}
                    </span>
                    <span className="calendar-upcoming-dot calendar-event-dot calendar-event-dot--holiday" />
                    <span className="calendar-upcoming-text">{holiday.name}</span>
                  </li>
                )
              })}
            </ul>
          </div>
        ) : null}
      </div>
      {eventIdPendingDelete ? (
        <div className="calendar-modal-backdrop">
          <div className="calendar-modal">
            <div className="calendar-modal-title">Remove event?</div>
            <p className="calendar-modal-text">
              Are you sure you want to remove this event? This can&apos;t be undone.
            </p>
            <div className="calendar-modal-actions">
              <button
                type="button"
                className="secondary-button calendar-modal-cancel"
                onClick={() => setEventIdPendingDelete(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="primary-button calendar-modal-confirm"
                onClick={handleConfirmRemoveEvent}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}


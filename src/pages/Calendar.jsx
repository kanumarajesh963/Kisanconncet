import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Sprout, CheckCircle2, Circle, CalendarDays, Bell, Loader2,
} from 'lucide-react'
import { supabase } from '../lib/supabaseClient.js'
import './Calendar.css'

export default function Calendar() {
  const navigate = useNavigate()
  const [entries, setEntries] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const loadEntries = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('crop_entries')
      .select('*, calendar_tasks(*)')
      .order('created_at', { ascending: true })

    if (error) {
      setLoadError('Could not load your calendar — check your connection')
      setLoading(false)
      return
    }
    setLoadError('')
    setEntries(data)
    setActiveId((prev) => prev || data[0]?.id || null)
    setLoading(false)
  }, [])

  useEffect(() => {
    loadEntries()
  }, [loadEntries])

  const current = entries.find((e) => e.id === activeId)

  const toggleTask = async (task) => {
    const nextStatus = task.status === 'done' ? 'upcoming' : 'done'
    setEntries((prev) =>
      prev.map((e) =>
        e.id !== current.id
          ? e
          : {
              ...e,
              calendar_tasks: e.calendar_tasks.map((t) =>
                t.id === task.id ? { ...t, status: nextStatus } : t
              ),
            }
      )
    )
    const { error } = await supabase
      .from('calendar_tasks')
      .update({ status: nextStatus })
      .eq('id', task.id)
    if (error) loadEntries()
  }

  if (loading) {
    return (
      <div className="cal-page">
        <div className="cal-header">
          <button className="cs-back" onClick={() => navigate('/home')}>
            <ArrowLeft size={18} />
          </button>
          <h1>Farming Calendar</h1>
        </div>
        <div className="market-loading">
          <Loader2 size={22} className="spin" /> Loading your calendar…
        </div>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="cal-page">
        <div className="cal-header">
          <button className="cs-back" onClick={() => navigate('/home')}>
            <ArrowLeft size={18} />
          </button>
          <h1>Farming Calendar</h1>
        </div>
        <div className="market-error">
          {loadError}
          <button onClick={loadEntries}>Retry</button>
        </div>
      </div>
    )
  }

  if (!current) {
    return (
      <div className="cal-page">
        <div className="cal-header">
          <button className="cs-back" onClick={() => navigate('/home')}>
            <ArrowLeft size={18} />
          </button>
          <h1>Farming Calendar</h1>
        </div>
        <div className="empty-state">
          <div className="empty-icon">🌱</div>
          <h2>No crops added yet</h2>
          <p>Once you add a crop, its stage and task reminders will show up here.</p>
        </div>
      </div>
    )
  }

  const doneCount = current.calendar_tasks.filter((t) => t.status === 'done').length

  return (
    <div className="cal-page">
      <div className="cal-header">
        <button className="cs-back" onClick={() => navigate('/home')}>
          <ArrowLeft size={18} />
        </button>
        <h1>Farming Calendar</h1>
      </div>

      <div className="crop-tabs">
        {entries.map((e) => (
          <button
            key={e.id}
            className={'crop-tab' + (e.id === activeId ? ' active' : '')}
            onClick={() => setActiveId(e.id)}
          >
            {e.crop}
          </button>
        ))}
      </div>

      <div className="crop-stage-card">
        <div className="stage-icon"><Sprout size={22} /></div>
        <div className="stage-info">
          <strong>{current.stage}</strong>
          <p>Planted on {current.planted_on}</p>
        </div>
        <div className="stage-progress">
          <span>{doneCount}/{current.calendar_tasks.length}</span>
          <small>done</small>
        </div>
      </div>

      <div className="section-heading">
        <h2>Upcoming Tasks</h2>
      </div>

      <div className="task-list">
        {current.calendar_tasks.map((t) => (
          <button
            className={'task-row' + (t.status === 'done' ? ' done' : '')}
            key={t.id}
            onClick={() => toggleTask(t)}
          >
            <span className="task-check">
              {t.status === 'done' ? (
                <CheckCircle2 size={20} className="check-on" />
              ) : (
                <Circle size={20} className="check-off" />
              )}
            </span>
            <div className="task-info">
              <strong>{t.task}</strong>
              <p><CalendarDays size={12} /> {t.due_date}</p>
            </div>
            {t.status !== 'done' && (
              <span className="task-reminder"><Bell size={13} /></span>
            )}
          </button>
        ))}
      </div>

      <div className="cal-tip-card">
        <strong>Advisory Tip</strong>
        <p>
          For {current.crop.toLowerCase()} in the {current.stage.toLowerCase()} stage, maintain
          consistent soil moisture and avoid heavy irrigation right before rainfall.
        </p>
      </div>
    </div>
  )
}

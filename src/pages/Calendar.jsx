import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Sprout, CheckCircle2, Circle, CalendarDays, Bell,
} from 'lucide-react'
import { cropCalendar } from '../data/mockData.js'
import './Calendar.css'
import './Calendar.css'

export default function Calendar() {
  const navigate = useNavigate()
  const [activeCrop, setActiveCrop] = useState(cropCalendar[0].crop)
  const [tasks, setTasks] = useState(
    Object.fromEntries(cropCalendar.map((c) => [c.crop, c.tasks]))
  )

  const current = cropCalendar.find((c) => c.crop === activeCrop)
  const currentTasks = tasks[activeCrop]

  const toggleTask = (idx) => {
    setTasks((prev) => ({
      ...prev,
      [activeCrop]: prev[activeCrop].map((t, i) =>
        i === idx ? { ...t, status: t.status === 'done' ? 'upcoming' : 'done' } : t
      ),
    }))
  }

  const doneCount = currentTasks.filter((t) => t.status === 'done').length

  return (
    <div className="cal-page">
      <div className="cal-header">
        <button className="cs-back" onClick={() => navigate('/home')}>
          <ArrowLeft size={18} />
        </button>
        <h1>Farming Calendar</h1>
      </div>

      <div className="crop-tabs">
        {cropCalendar.map((c) => (
          <button
            key={c.crop}
            className={'crop-tab' + (c.crop === activeCrop ? ' active' : '')}
            onClick={() => setActiveCrop(c.crop)}
          >
            {c.crop}
          </button>
        ))}
      </div>

      <div className="crop-stage-card">
        <div className="stage-icon"><Sprout size={22} /></div>
        <div className="stage-info">
          <strong>{current.stage}</strong>
          <p>Planted on {current.plantedOn}</p>
        </div>
        <div className="stage-progress">
          <span>{doneCount}/{currentTasks.length}</span>
          <small>done</small>
        </div>
      </div>

      <div className="section-heading">
        <h2>Upcoming Tasks</h2>
      </div>

      <div className="task-list">
        {currentTasks.map((t, idx) => (
          <button
            className={'task-row' + (t.status === 'done' ? ' done' : '')}
            key={t.task}
            onClick={() => toggleTask(idx)}
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
              <p><CalendarDays size={12} /> {t.date}</p>
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

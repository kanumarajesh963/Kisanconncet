import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Power, Zap, Droplet, ShieldCheck, Wifi, WifiOff,
  Plus, Clock, Trash2, MessageSquareText,
} from 'lucide-react'
import { motorStatus as initialMotor } from '../data/mockData.js'
import './MotorControl.css'

export default function MotorControl() {
  const navigate = useNavigate()
  const [isOn, setIsOn] = useState(initialMotor.isOn)
  const [isOnline] = useState(true)
  const [schedule, setSchedule] = useState(initialMotor.schedule)
  const [toggling, setToggling] = useState(false)

  const handleToggle = () => {
    if (toggling) return
    setToggling(true)
    setTimeout(() => {
      setIsOn((prev) => !prev)
      setToggling(false)
    }, 700)
  }

  const toggleScheduleActive = (idx) => {
    setSchedule((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, active: !s.active } : s))
    )
  }

  const removeSchedule = (idx) => {
    setSchedule((prev) => prev.filter((_, i) => i !== idx))
  }

  const addSchedule = () => {
    setSchedule((prev) => [
      ...prev,
      { time: '7:00 AM', duration: '30 min', days: 'Daily', active: true },
    ])
  }

  return (
    <div className="motor-page">
      <div className="motor-header">
        <button className="cs-back" onClick={() => navigate('/home')}>
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1>Motor Control</h1>
          <span className="motor-name">{initialMotor.name}</span>
        </div>
        <span className={'conn-pill ' + (isOnline ? 'online' : 'offline')}>
          {isOnline ? <Wifi size={13} /> : <WifiOff size={13} />}
          {isOnline ? 'Online' : 'Offline'}
        </span>
      </div>

      <div className={'power-card ' + (isOn ? 'is-on' : '')}>
        <button
          className={'power-btn' + (isOn ? ' on' : '') + (toggling ? ' loading' : '')}
          onClick={handleToggle}
        >
          <span className="power-ring" />
          <Power size={34} strokeWidth={2.4} />
        </button>
        <h2>{toggling ? (isOn ? 'Turning OFF…' : 'Turning ON…') : isOn ? 'Motor is ON' : 'Motor is OFF'}</h2>
        <p>{isOn ? 'Running since 6:12 AM' : `Last run: ${initialMotor.lastRun}`}</p>
      </div>

      {!isOnline && (
        <div className="sms-banner">
          <MessageSquareText size={16} />
          <span>Network unavailable — controlling via SMS fallback</span>
        </div>
      )}

      <div className="info-grid">
        <div className="info-card">
          <span className="info-icon"><Zap size={16} /></span>
          <div>
            <strong>{initialMotor.powerSource}</strong>
            <p>Power Source</p>
          </div>
        </div>
        <div className="info-card">
          <span className="info-icon water"><Droplet size={16} /></span>
          <div>
            <strong>{initialMotor.waterLevel}</strong>
            <p>Water Level</p>
          </div>
        </div>
        <div className="info-card full">
          <span className="info-icon shield"><ShieldCheck size={16} /></span>
          <div>
            <strong>Dry-Run Protection {initialMotor.dryRunProtection ? 'Active' : 'Off'}</strong>
            <p>Motor auto-stops if water level runs low, protecting the pump</p>
          </div>
        </div>
      </div>

      <div className="section-heading schedule-heading">
        <h2>Auto-Schedule</h2>
        <button className="add-btn" onClick={addSchedule}>
          <Plus size={15} /> Add
        </button>
      </div>

      <div className="schedule-list">
        {schedule.length === 0 && (
          <p className="empty-note">No schedules set. Tap "Add" to create one.</p>
        )}
        {schedule.map((s, idx) => (
          <div className="schedule-row" key={idx}>
            <div className="schedule-icon"><Clock size={16} /></div>
            <div className="schedule-info">
              <strong>{s.time} · {s.duration}</strong>
              <p>{s.days}</p>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={s.active}
                onChange={() => toggleScheduleActive(idx)}
              />
              <span className="slider" />
            </label>
            <button className="delete-btn" onClick={() => removeSchedule(idx)}>
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>

      <div className="alert-note-card">
        <strong>Power Alerts</strong>
        <p>You'll get an SMS &amp; push notification if power goes out or the motor stops unexpectedly.</p>
      </div>
    </div>
  )
}

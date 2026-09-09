import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, MapPin, Phone, Sprout, LogOut, ChevronRight, Globe, Bell,
  HelpCircle, X, Check, Mail, MessageCircle, CheckCircle2,
} from 'lucide-react'
import { user } from '../data/mockData.js'
import './Profile.css'

const languages = ['English', 'हिंदी (Hindi)', 'मराठी (Marathi)', 'తెలుగు (Telugu)']

function loadPref(key, fallback) {
  try {
    const v = localStorage.getItem(key)
    return v === null ? fallback : JSON.parse(v)
  } catch {
    return fallback
  }
}

export default function Profile() {
  const navigate = useNavigate()
  const [language, setLanguage] = useState(() => loadPref('kc_language', 'English'))
  const [notificationsOn, setNotificationsOn] = useState(() => loadPref('kc_notifications', true))
  const [showLangSheet, setShowLangSheet] = useState(false)
  const [showHelpSheet, setShowHelpSheet] = useState(false)
  const [toast, setToast] = useState('')

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2200)
  }

  const selectLanguage = (lang) => {
    setLanguage(lang)
    localStorage.setItem('kc_language', JSON.stringify(lang))
    setShowLangSheet(false)
    if (lang === 'English') {
      showToast('Language set to English')
    } else {
      showToast(`${lang} selected — full app translation coming soon`)
    }
  }

  const toggleNotifications = () => {
    const next = !notificationsOn
    setNotificationsOn(next)
    localStorage.setItem('kc_notifications', JSON.stringify(next))
    showToast(next ? 'Notifications turned on' : 'Notifications turned off')
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <button className="cs-back" onClick={() => navigate('/home')}>
          <ArrowLeft size={18} />
        </button>
        <h1>My Profile</h1>
      </div>

      <div className="profile-card">
        <div className="avatar">{user.name.charAt(0)}</div>
        <div>
          <h2>{user.name}</h2>
          <p><MapPin size={13} /> {user.village}</p>
          <p><Phone size={13} /> {user.phone}</p>
        </div>
      </div>

      <div className="profile-stats">
        <div className="stat">
          <span className="stat-value">{user.farmSize}</span>
          <span className="stat-label">Farm Size</span>
        </div>
        <div className="stat">
          <span className="stat-value">{user.crops.length}</span>
          <span className="stat-label">Active Crops</span>
        </div>
      </div>

      <div className="crop-tags">
        {user.crops.map((c) => (
          <span key={c} className="crop-tag"><Sprout size={12} /> {c}</span>
        ))}
      </div>

      <div className="menu-list">
        <button className="menu-row" onClick={() => setShowLangSheet(true)}>
          <div className="menu-left">
            <Globe size={18} />
            <span>App Language</span>
          </div>
          <div className="menu-right">
            <span>{language}</span>
            <ChevronRight size={16} />
          </div>
        </button>

        <div className="menu-row">
          <div className="menu-left">
            <Bell size={18} />
            <span>Notifications</span>
          </div>
          <label className="switch">
            <input type="checkbox" checked={notificationsOn} onChange={toggleNotifications} />
            <span className="slider" />
          </label>
        </div>

        <button className="menu-row" onClick={() => setShowHelpSheet(true)}>
          <div className="menu-left">
            <HelpCircle size={18} />
            <span>Help &amp; Support</span>
          </div>
          <ChevronRight size={16} />
        </button>
      </div>

      <button className="logout-btn" onClick={() => navigate('/')}>
        <LogOut size={17} /> Log Out
      </button>

      {showLangSheet && (
        <div className="bid-sheet-overlay" onClick={() => setShowLangSheet(false)}>
          <div className="bid-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-header">
              <h3>App Language</h3>
              <button onClick={() => setShowLangSheet(false)}><X size={18} /></button>
            </div>
            <p className="sheet-sub">Full translation is being rolled out — English is fully supported today.</p>
            <div className="lang-list">
              {languages.map((lang) => (
                <button
                  key={lang}
                  className={'lang-row' + (language === lang ? ' active' : '')}
                  onClick={() => selectLanguage(lang)}
                >
                  {lang}
                  {language === lang && <Check size={16} />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showHelpSheet && (
        <div className="bid-sheet-overlay" onClick={() => setShowHelpSheet(false)}>
          <div className="bid-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-header">
              <h3>Help &amp; Support</h3>
              <button onClick={() => setShowHelpSheet(false)}><X size={18} /></button>
            </div>
            <p className="sheet-sub">We're here to help with any questions about KisanConnect.</p>
            <a className="help-row" href="mailto:support@kisanconnect.app">
              <Mail size={17} />
              <div>
                <strong>Email Support</strong>
                <span>support@kisanconnect.app</span>
              </div>
            </a>
            <a className="help-row" href="tel:+911800123456">
              <Phone size={17} />
              <div>
                <strong>Call Helpline</strong>
                <span>1800-123-456 (toll-free)</span>
              </div>
            </a>
            <button className="help-row" onClick={() => navigate('/community')}>
              <MessageCircle size={17} />
              <div>
                <strong>Ask the Community</strong>
                <span>Post your question in the forum</span>
              </div>
            </button>
          </div>
        </div>
      )}

      {toast && (
        <div className="toast">
          <CheckCircle2 size={15} /> {toast}
        </div>
      )}
    </div>
  )
}

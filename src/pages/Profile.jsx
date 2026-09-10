import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, MapPin, Phone, Sprout, LogOut, ChevronRight, Globe, Bell,
  HelpCircle, X, Check, Mail, MessageCircle, CheckCircle2, Moon,
} from 'lucide-react'
import { user } from '../data/mockData.js'
import { getLocationLabel } from '../lib/weather.js'
import { useLanguage, LANGUAGES } from '../lib/i18n.jsx'
import { getTheme, applyTheme } from '../lib/theme.js'
import './Profile.css'

function loadPref(key, fallback) {
  try {
    const v = sessionStorage.getItem(key)
    return v === null ? fallback : JSON.parse(v)
  } catch {
    return fallback
  }
}

export default function Profile() {
  const navigate = useNavigate()
  const { lang, setLang, t } = useLanguage()
  const [notificationsOn, setNotificationsOn] = useState(() => loadPref('kc_notifications', true))
  const [darkMode, setDarkMode] = useState(() => getTheme() === 'dark')
  const [phone] = useState(() => loadPref('kc_user_phone', user.phone))
  const [location, setLocation] = useState('Detecting location…')
  const [showLangSheet, setShowLangSheet] = useState(false)
  const [showHelpSheet, setShowHelpSheet] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    getLocationLabel().then((loc) => setLocation(loc || 'Location unavailable'))
  }, [])

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2200)
  }

  const selectLanguage = (code, label) => {
    setLang(code)
    setShowLangSheet(false)
    showToast(`Language set to ${label}`)
  }

  const toggleNotifications = () => {
    const next = !notificationsOn
    setNotificationsOn(next)
    sessionStorage.setItem('kc_notifications', JSON.stringify(next))
    showToast(next ? 'Notifications turned on' : 'Notifications turned off')
  }

  const toggleDarkMode = () => {
    const next = !darkMode
    setDarkMode(next)
    applyTheme(next ? 'dark' : 'light')
  }

  const currentLangLabel = LANGUAGES.find((l) => l.code === lang)?.label || 'English'

  return (
    <div className="profile-page">
      <div className="profile-header">
        <button className="cs-back" onClick={() => navigate('/home')}>
          <ArrowLeft size={18} />
        </button>
        <h1>{t('profile.title')}</h1>
      </div>

      <div className="profile-card">
        <div className="avatar">{user.name.charAt(0)}</div>
        <div>
          <h2>{user.name}</h2>
          <p><MapPin size={13} /> {location}</p>
          <p><Phone size={13} /> {phone}</p>
        </div>
      </div>

      <div className="profile-stats">
        <div className="stat">
          <span className="stat-value">{user.farmSize}</span>
          <span className="stat-label">{t('profile.farmSize')}</span>
        </div>
        <div className="stat">
          <span className="stat-value">{user.crops.length}</span>
          <span className="stat-label">{t('profile.activeCrops')}</span>
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
            <span>{t('profile.appLanguage')}</span>
          </div>
          <div className="menu-right">
            <span>{currentLangLabel}</span>
            <ChevronRight size={16} />
          </div>
        </button>

        <div className="menu-row">
          <div className="menu-left">
            <Moon size={18} />
            <span>{t('profile.darkMode')}</span>
          </div>
          <label className="switch">
            <input type="checkbox" checked={darkMode} onChange={toggleDarkMode} />
            <span className="slider" />
          </label>
        </div>

        <div className="menu-row">
          <div className="menu-left">
            <Bell size={18} />
            <span>{t('profile.notifications')}</span>
          </div>
          <label className="switch">
            <input type="checkbox" checked={notificationsOn} onChange={toggleNotifications} />
            <span className="slider" />
          </label>
        </div>

        <button className="menu-row" onClick={() => setShowHelpSheet(true)}>
          <div className="menu-left">
            <HelpCircle size={18} />
            <span>{t('profile.helpSupport')}</span>
          </div>
          <ChevronRight size={16} />
        </button>
      </div>

      <button className="logout-btn" onClick={() => navigate('/')}>
        <LogOut size={17} /> {t('profile.logout')}
      </button>

      {showLangSheet && (
        <div className="bid-sheet-overlay" onClick={() => setShowLangSheet(false)}>
          <div className="bid-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-header">
              <h3>{t('profile.appLanguage')}</h3>
              <button onClick={() => setShowLangSheet(false)}><X size={18} /></button>
            </div>
            <div className="lang-list">
              {LANGUAGES.map(({ code, label }) => (
                <button
                  key={code}
                  className={'lang-row' + (lang === code ? ' active' : '')}
                  onClick={() => selectLanguage(code, label)}
                >
                  {label}
                  {lang === code && <Check size={16} />}
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
              <h3>{t('profile.helpSupport')}</h3>
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

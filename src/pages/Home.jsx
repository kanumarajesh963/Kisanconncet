import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  CloudRain, Power, TrendingUp, Calendar, Stethoscope, ShoppingCart,
  Landmark, Users, ChevronRight, Droplets, Wind,
} from 'lucide-react'
import { user, motorStatus, mandiPrices } from '../data/mockData.js'
import { fetchWeatherData } from '../lib/weather.js'
import { useLanguage } from '../lib/i18n.jsx'
import './Home.css'

const quickActions = [
  { to: '/weather', icon: CloudRain, key: 'quick.weather', color: '#2E7CD6', bg: '#E8F1FC' },
  { to: '/mandi', icon: TrendingUp, key: 'quick.mandi', color: '#F5A623', bg: '#FDF3E2' },
  { to: '/motor', icon: Power, key: 'quick.motor', color: '#1F8A45', bg: '#E6F4EA' },
  { to: '/calendar', icon: Calendar, key: 'quick.calendar', color: '#8B5CF6', bg: '#F1EBFD' },
  { to: '/crop-doctor', icon: Stethoscope, key: 'quick.cropDoctor', color: '#E14B4B', bg: '#FBEAEA' },
  { to: '/marketplace', icon: ShoppingCart, key: 'quick.marketplace', color: '#0EA5A5', bg: '#E3F6F6' },
  { to: '/schemes', icon: Landmark, key: 'quick.schemes', color: '#B45309', bg: '#FBEEDD' },
  { to: '/community', icon: Users, key: 'quick.community', color: '#DB2777', bg: '#FCE7F1' },
]

const bestMandi = mandiPrices[0]
const bestMarket = [...bestMandi.markets].sort((a, b) => b.price - a.price)[0]

export default function Home() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const [weather, setWeather] = useState(null)
  const [weatherLoading, setWeatherLoading] = useState(true)

  useEffect(() => {
    fetchWeatherData()
      .then((data) => setWeather(data))
      .catch(() => setWeather(null))
      .finally(() => setWeatherLoading(false))
  }, [])

  return (
    <div className="home-page">
      <div className="home-header">
        <div>
          <p className="greeting-eyebrow">Namaste 🙏</p>
          <h1>{user.name.split(' ')[0]}</h1>
          <span className="home-location">
            {weather?.today.location || (weatherLoading ? 'Detecting location…' : 'Location unavailable')}
          </span>
        </div>
        <button className="avatar-btn" onClick={() => navigate('/profile')}>
          {user.name.charAt(0)}
        </button>
      </div>

      <Link to="/weather" className="weather-card">
        <div className="weather-main">
          <span className="weather-icon">{weatherLoading ? '⛅' : weather?.today.icon || '⛅'}</span>
          <div>
            <h2>{weatherLoading ? '—' : weather ? `${weather.today.temp}°C` : 'N/A'}</h2>
            <span>{weatherLoading ? 'Loading…' : weather?.today.condition || 'Unavailable'}</span>
          </div>
        </div>
        <div className="weather-meta">
          <span><Droplets size={14} /> {weather ? `${weather.today.humidity}%` : '—'}</span>
          <span><Wind size={14} /> {weather ? `${weather.today.wind} km/h` : '—'}</span>
        </div>
        <ChevronRight size={18} className="chevron" />
      </Link>

      <div className="stat-row">
        <Link to="/motor" className="stat-card">
          <div className="stat-card-top">
            <span className="stat-icon motor"><Power size={16} /></span>
            <span className={'status-dot ' + (motorStatus.isOn ? 'on' : 'off')} />
          </div>
          <h3>{motorStatus.name}</h3>
          <p>{motorStatus.isOn ? 'Running' : 'Currently OFF'}</p>
        </Link>

        <Link to="/mandi" className="stat-card">
          <div className="stat-card-top">
            <span className="stat-icon mandi"><TrendingUp size={16} /></span>
          </div>
          <h3>₹{bestMarket.price}</h3>
          <p>{bestMandi.crop} · {bestMarket.name}</p>
        </Link>
      </div>

      {weather?.sprayAdvisory && (
        <div className="advisory-card">
          <div className="advisory-icon">🧪</div>
          <div>
            <strong>{t('home.sprayAdvisory')}</strong>
            <p>{weather.sprayAdvisory.message}</p>
          </div>
        </div>
      )}

      <div className="section-heading">
        <h2>{t('home.quickAccess')}</h2>
      </div>

      <div className="quick-grid">
        {quickActions.map(({ to, icon: Icon, key, color, bg }) => (
          <Link to={to} key={to} className="quick-item">
            <div className="quick-icon" style={{ background: bg, color }}>
              <Icon size={20} strokeWidth={2} />
            </div>
            <span>{t(key)}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}

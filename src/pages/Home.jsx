import { Link, useNavigate } from 'react-router-dom'
import {
  CloudRain, Power, TrendingUp, Calendar, Stethoscope, ShoppingCart,
  Landmark, Users, ChevronRight, Droplets, Wind, AlertTriangle,
} from 'lucide-react'
import {
  user, weatherToday, motorStatus, mandiPrices, sprayAdvisory,
} from '../data/mockData.js'
import './Home.css'

const quickActions = [
  { to: '/weather', icon: CloudRain, label: 'Weather', color: '#2E7CD6', bg: '#E8F1FC' },
  { to: '/mandi', icon: TrendingUp, label: 'Mandi Prices', color: '#F5A623', bg: '#FDF3E2' },
  { to: '/motor', icon: Power, label: 'Motor Control', color: '#1F8A45', bg: '#E6F4EA' },
  { to: '/calendar', icon: Calendar, label: 'Calendar', color: '#8B5CF6', bg: '#F1EBFD' },
  { to: '/crop-doctor', icon: Stethoscope, label: 'Crop Doctor', color: '#E14B4B', bg: '#FBEAEA' },
  { to: '/marketplace', icon: ShoppingCart, label: 'Marketplace', color: '#0EA5A5', bg: '#E3F6F6' },
  { to: '/schemes', icon: Landmark, label: 'Govt Schemes', color: '#B45309', bg: '#FBEEDD' },
  { to: '/community', icon: Users, label: 'Community', color: '#DB2777', bg: '#FCE7F1' },
]

const bestMandi = mandiPrices[0]
const bestMarket = [...bestMandi.markets].sort((a, b) => b.price - a.price)[0]

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="home-page">
      <div className="home-header">
        <div>
          <p className="greeting-eyebrow">Namaste 🙏</p>
          <h1>{user.name.split(' ')[0]}</h1>
          <span className="home-location">{user.village}</span>
        </div>
        <button className="avatar-btn" onClick={() => navigate('/profile')}>
          {user.name.charAt(0)}
        </button>
      </div>

      {weatherToday.alert && (
        <div className="alert-banner">
          <AlertTriangle size={18} />
          <div>
            <strong>Weather Alert</strong>
            <p>{weatherToday.alert.message}</p>
          </div>
        </div>
      )}

      <Link to="/weather" className="weather-card">
        <div className="weather-main">
          <span className="weather-icon">⛅</span>
          <div>
            <h2>{weatherToday.temp}°C</h2>
            <span>{weatherToday.condition}</span>
          </div>
        </div>
        <div className="weather-meta">
          <span><Droplets size={14} /> {weatherToday.humidity}%</span>
          <span><Wind size={14} /> {weatherToday.wind} km/h</span>
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

      <div className="advisory-card">
        <div className="advisory-icon">🧪</div>
        <div>
          <strong>Today's Spray Advisory</strong>
          <p>{sprayAdvisory.message}</p>
        </div>
      </div>

      <div className="section-heading">
        <h2>Quick Access</h2>
      </div>

      <div className="quick-grid">
        {quickActions.map(({ to, icon: Icon, label, color, bg }) => (
          <Link to={to} key={to} className="quick-item">
            <div className="quick-icon" style={{ background: bg, color }}>
              <Icon size={20} strokeWidth={2} />
            </div>
            <span>{label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}

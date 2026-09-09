import { useNavigate } from 'react-router-dom'
import { ArrowLeft, MapPin, Phone, Sprout, LogOut, ChevronRight, Globe, Bell, HelpCircle } from 'lucide-react'
import { user } from '../data/mockData.js'
import './Profile.css'

const menuItems = [
  { icon: Globe, label: 'App Language', value: 'English' },
  { icon: Bell, label: 'Notifications', value: 'On' },
  { icon: HelpCircle, label: 'Help & Support', value: '' },
]

export default function Profile() {
  const navigate = useNavigate()
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
        {menuItems.map(({ icon: Icon, label, value }) => (
          <div className="menu-row" key={label}>
            <div className="menu-left">
              <Icon size={18} />
              <span>{label}</span>
            </div>
            <div className="menu-right">
              {value && <span>{value}</span>}
              <ChevronRight size={16} />
            </div>
          </div>
        ))}
      </div>

      <button className="logout-btn" onClick={() => navigate('/')}>
        <LogOut size={17} /> Log Out
      </button>
    </div>
  )
}

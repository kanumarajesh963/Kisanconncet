import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Calendar, Stethoscope, ShoppingCart, Landmark, Tractor,
  Banknote, Leaf, Users, User, ChevronRight,
} from 'lucide-react'
import { user } from '../data/mockData.js'
import { getLocationLabel } from '../lib/weather.js'
import { useLanguage } from '../lib/i18n.jsx'
import './More.css'

const items = [
  { to: '/calendar', icon: Calendar, labelKey: 'more.calendar.label', descKey: 'more.calendar.desc' },
  { to: '/crop-doctor', icon: Stethoscope, labelKey: 'more.cropDoctor.label', descKey: 'more.cropDoctor.desc' },
  { to: '/marketplace', icon: ShoppingCart, labelKey: 'more.marketplace.label', descKey: 'more.marketplace.desc' },
  { to: '/schemes', icon: Landmark, labelKey: 'more.schemes.label', descKey: 'more.schemes.desc' },
  { to: '/equipment', icon: Tractor, labelKey: 'more.equipment.label', descKey: 'more.equipment.desc' },
  { to: '/loans', icon: Banknote, labelKey: 'more.loans.label', descKey: 'more.loans.desc' },
  { to: '/soil-health', icon: Leaf, labelKey: 'more.soilHealth.label', descKey: 'more.soilHealth.desc' },
  { to: '/community', icon: Users, labelKey: 'more.community.label', descKey: 'more.community.desc' },
]

export default function More() {
  const [location, setLocation] = useState('Detecting location…')
  const { t } = useLanguage()

  useEffect(() => {
    getLocationLabel().then((loc) => setLocation(loc || 'Location unavailable'))
  }, [])

  return (
    <div className="more-page">
      <div className="more-header">
        <h1>{t('more.title')}</h1>
        <p>{t('more.subtitle')}</p>
      </div>

      <Link to="/profile" className="profile-row">
        <div className="profile-row-left">
          <div className="avatar-sm">{user.name.charAt(0)}</div>
          <div>
            <h3>{user.name}</h3>
            <span>{location}</span>
          </div>
        </div>
        <ChevronRight size={18} />
      </Link>

      <div className="more-grid">
        {items.map(({ to, icon: Icon, labelKey, descKey }) => (
          <Link to={to} key={to} className="more-card">
            <div className="more-icon">
              <Icon size={20} strokeWidth={2} />
            </div>
            <h4>{t(labelKey)}</h4>
            <p>{t(descKey)}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}

import { Link } from 'react-router-dom'
import {
  Calendar, Stethoscope, ShoppingCart, Landmark, Tractor,
  Banknote, Leaf, Users, User, ChevronRight,
} from 'lucide-react'
import { user } from '../data/mockData.js'
import './More.css'

const items = [
  { to: '/calendar', icon: Calendar, label: 'Farming Calendar', desc: 'Sowing, irrigation & harvest reminders' },
  { to: '/crop-doctor', icon: Stethoscope, label: 'Crop Doctor (AI)', desc: 'Photo-based disease detection' },
  { to: '/marketplace', icon: ShoppingCart, label: 'Marketplace', desc: 'Buy & sell produce directly' },
  { to: '/schemes', icon: Landmark, label: 'Govt Schemes', desc: 'Subsidies & eligibility checker' },
  { to: '/equipment', icon: Tractor, label: 'Equipment Rental', desc: 'Tractors, harvesters & drones' },
  { to: '/loans', icon: Banknote, label: 'Loans & Insurance', desc: 'Compare crop loan offers' },
  { to: '/soil-health', icon: Leaf, label: 'Soil Health Advisor', desc: 'Soil report & fertilizer advice' },
  { to: '/community', icon: Users, label: 'Community Forum', desc: 'Q&A, experts & success stories' },
]

export default function More() {
  return (
    <div className="more-page">
      <div className="more-header">
        <h1>More</h1>
        <p>Explore all KisanConnect features</p>
      </div>

      <Link to="/profile" className="profile-row">
        <div className="profile-row-left">
          <div className="avatar-sm">{user.name.charAt(0)}</div>
          <div>
            <h3>{user.name}</h3>
            <span>{user.village}</span>
          </div>
        </div>
        <ChevronRight size={18} />
      </Link>

      <div className="more-grid">
        {items.map(({ to, icon: Icon, label, desc }) => (
          <Link to={to} key={to} className="more-card">
            <div className="more-icon">
              <Icon size={20} strokeWidth={2} />
            </div>
            <h4>{label}</h4>
            <p>{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}

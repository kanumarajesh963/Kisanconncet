import { NavLink, Outlet } from 'react-router-dom'
import { Home, CloudSun, TrendingUp, Power, Menu } from 'lucide-react'
import './AppShell.css'

const navItems = [
  { to: '/home', label: 'Home', icon: Home },
  { to: '/weather', label: 'Weather', icon: CloudSun },
  { to: '/mandi', label: 'Mandi', icon: TrendingUp },
  { to: '/motor', label: 'Motor', icon: Power },
  { to: '/more', label: 'More', icon: Menu },
]

export default function AppShell() {
  return (
    <div className="phone-frame">
      <div className="phone-screen">
        <Outlet />
      </div>
      <nav className="bottom-nav">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}
          >
            <Icon size={22} strokeWidth={2.2} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

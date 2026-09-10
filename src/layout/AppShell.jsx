import { NavLink, Outlet } from 'react-router-dom'
import { Home, CloudSun, TrendingUp, Power, Menu } from 'lucide-react'
import { useLanguage } from '../lib/i18n.jsx'
import './AppShell.css'

const navItems = [
  { to: '/home', key: 'nav.home', icon: Home },
  { to: '/weather', key: 'nav.weather', icon: CloudSun },
  { to: '/mandi', key: 'nav.mandi', icon: TrendingUp },
  { to: '/motor', key: 'nav.motor', icon: Power },
  { to: '/more', key: 'nav.more', icon: Menu },
]

export default function AppShell() {
  const { t } = useLanguage()
  return (
    <div className="phone-frame">
      <div className="phone-screen">
        <Outlet />
      </div>
      <nav className="bottom-nav">
        {navItems.map(({ to, key, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}
          >
            <Icon size={22} strokeWidth={2.2} />
            <span>{t(key)}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

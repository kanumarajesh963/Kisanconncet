import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import './ComingSoon.css'

export default function ComingSoon({ icon, title, description }) {
  const navigate = useNavigate()
  return (
    <div className="coming-soon">
      <button className="cs-back" onClick={() => navigate('/home')}>
        <ArrowLeft size={18} />
      </button>
      <div className="cs-icon">{icon}</div>
      <h2>{title}</h2>
      <p>{description}</p>
      <span className="cs-badge">Coming soon</span>
    </div>
  )
}

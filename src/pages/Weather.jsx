import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, MapPin, Droplets, Wind, CloudRain, AlertTriangle,
  CheckCircle2, XCircle, Sunrise, Sunset,
} from 'lucide-react'
import { weatherToday, weatherForecast, sprayAdvisory } from '../data/mockData.js'
import './Weather.css'

export default function Weather() {
  const navigate = useNavigate()
  const sprayOk = sprayAdvisory.status === 'recommended'

  return (
    <div className="weather-page">
      <div className="weather-page-header">
        <button className="cs-back" onClick={() => navigate('/home')}>
          <ArrowLeft size={18} />
        </button>
        <h1>Weather &amp; Alerts</h1>
      </div>

      <div className="location-row">
        <MapPin size={13} /> {weatherToday.location}
      </div>

      <div className="current-card">
        <div className="current-top">
          <div>
            <h2>{weatherToday.temp}°C</h2>
            <span>{weatherToday.condition}</span>
          </div>
          <span className="current-icon">⛅</span>
        </div>
        <div className="current-stats">
          <div className="current-stat">
            <Droplets size={16} />
            <strong>{weatherToday.humidity}%</strong>
            <span>Humidity</span>
          </div>
          <div className="current-stat">
            <Wind size={16} />
            <strong>{weatherToday.wind} km/h</strong>
            <span>Wind</span>
          </div>
          <div className="current-stat">
            <CloudRain size={16} />
            <strong>{weatherToday.rainChance}%</strong>
            <span>Rain Chance</span>
          </div>
        </div>
      </div>

      {weatherToday.alert && (
        <div className="alert-banner-lg">
          <AlertTriangle size={20} />
          <div>
            <strong>Rain Alert</strong>
            <p>{weatherToday.alert.message}</p>
          </div>
        </div>
      )}

      <div className={'spray-card ' + (sprayOk ? 'ok' : 'not-ok')}>
        <div className="spray-icon">
          {sprayOk ? <CheckCircle2 size={22} /> : <XCircle size={22} />}
        </div>
        <div>
          <strong>{sprayOk ? 'Safe to Spray Today' : 'Spraying Not Recommended'}</strong>
          <p>{sprayAdvisory.message}</p>
        </div>
      </div>

      <div className="section-heading">
        <h2>7-Day Forecast</h2>
      </div>

      <div className="forecast-scroll">
        {weatherForecast.map((d) => (
          <div className={'forecast-card' + (d.day === 'Today' ? ' today' : '')} key={d.day}>
            <span className="forecast-day">{d.day}</span>
            <span className="forecast-icon">{d.icon}</span>
            <span className="forecast-temp">{d.high}° <em>{d.low}°</em></span>
            <span className="forecast-rain"><CloudRain size={11} /> {d.rain}%</span>
          </div>
        ))}
      </div>

      <div className="sun-row">
        <div className="sun-card">
          <Sunrise size={18} />
          <div>
            <strong>6:12 AM</strong>
            <span>Sunrise</span>
          </div>
        </div>
        <div className="sun-card">
          <Sunset size={18} />
          <div>
            <strong>6:48 PM</strong>
            <span>Sunset</span>
          </div>
        </div>
      </div>
    </div>
  )
}

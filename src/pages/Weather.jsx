import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, MapPin, Droplets, Wind, CloudRain, AlertTriangle,
  CheckCircle2, XCircle, Sunrise, Sunset, Loader2,
} from 'lucide-react'
import { fetchWeatherData } from '../lib/weather.js'
import './Weather.css'

export default function Weather() {
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const result = await fetchWeatherData()
      setData(result)
    } catch (err) {
      setError('Could not load live weather — check your internet connection and try again')
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  if (loading) {
    return (
      <div className="weather-page">
        <div className="weather-page-header">
          <button className="cs-back" onClick={() => navigate('/home')}>
            <ArrowLeft size={18} />
          </button>
          <h1>Weather &amp; Alerts</h1>
        </div>
        <div className="market-loading">
          <Loader2 size={22} className="spin" /> Fetching live weather…
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="weather-page">
        <div className="weather-page-header">
          <button className="cs-back" onClick={() => navigate('/home')}>
            <ArrowLeft size={18} />
          </button>
          <h1>Weather &amp; Alerts</h1>
        </div>
        <div className="market-error">
          {error}
          <button onClick={load}>Retry</button>
        </div>
      </div>
    )
  }

  const { today, forecast, sprayAdvisory } = data
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
        <MapPin size={13} /> {today.location}
        {today.locationSource === 'ip' && (
          <span className="location-fallback-note">(approximate — via network)</span>
        )}
      </div>
      <div className="coords-row">
        {today.coordsLabel} · source: {today.locationSource === 'gps' ? 'GPS' : 'IP-based'}
      </div>

      <div className="current-card">
        <div className="current-top">
          <div>
            <h2>{today.temp}°C</h2>
            <span>{today.condition}</span>
          </div>
          <span className="current-icon">{today.icon}</span>
        </div>
        <div className="current-stats">
          <div className="current-stat">
            <Droplets size={16} />
            <strong>{today.humidity}%</strong>
            <span>Humidity</span>
          </div>
          <div className="current-stat">
            <Wind size={16} />
            <strong>{today.wind} km/h</strong>
            <span>Wind</span>
          </div>
          <div className="current-stat">
            <CloudRain size={16} />
            <strong>{today.rainChance}%</strong>
            <span>Rain Chance</span>
          </div>
        </div>
      </div>

      {today.alert && (
        <div className="alert-banner-lg">
          <AlertTriangle size={20} />
          <div>
            <strong>Rain Alert</strong>
            <p>{today.alert.message}</p>
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
        <h2>{forecast.length}-Day Forecast</h2>
      </div>

      <div className="forecast-scroll">
        {forecast.map((d) => (
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
            <strong>{today.sunrise}</strong>
            <span>Sunrise</span>
          </div>
        </div>
        <div className="sun-card">
          <Sunset size={18} />
          <div>
            <strong>{today.sunset}</strong>
            <span>Sunset</span>
          </div>
        </div>
      </div>
    </div>
  )
}

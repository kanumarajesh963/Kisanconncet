import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, MapPin, Droplets, Wind, CloudRain, AlertTriangle,
  CheckCircle2, XCircle, Sunrise, Sunset, Loader2, RefreshCw, Gauge, Eye,
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import { fetchWeatherData } from '../lib/weather.js'
import './Weather.css'

export default function Weather() {
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async (force = false) => {
    force ? setRefreshing(true) : setLoading(true)
    setError('')
    try {
      const result = await fetchWeatherData({ force })
      setData(result)
    } catch (err) {
      setError('Could not load live weather — check your internet connection and try again')
    }
    setLoading(false)
    setRefreshing(false)
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
          <button onClick={() => load(true)}>Retry</button>
        </div>
      </div>
    )
  }

  const { today, forecast, hourly, airQuality, moonPhase, sprayAdvisory } = data
  const sprayOk = sprayAdvisory.status === 'recommended'
  const dayPct = Math.round(today.dayProgress * 100)

  return (
    <div className="weather-page">
      <div className="weather-page-header">
        <button className="cs-back" onClick={() => navigate('/home')}>
          <ArrowLeft size={18} />
        </button>
        <h1>Weather &amp; Alerts</h1>
        <button className="refresh-btn" onClick={() => load(true)} disabled={refreshing} title="Refresh location & weather">
          <RefreshCw size={16} className={refreshing ? 'spin' : ''} />
        </button>
      </div>

      <div className="location-row">
        <MapPin size={13} /> {today.location}
        {today.locationSource === 'ip' && (
          <span className="location-fallback-note">(approximate — via network)</span>
        )}
      </div>

      <div className="hero-section">
        <div className="hero-top">
          <h2>{today.temp}<sup>°</sup></h2>
          <span className="hero-icon">{today.icon}</span>
        </div>
        <p className="hero-summary">
          {today.condition} · {forecast[0]?.low}°/{forecast[0]?.high}° · Feels like {today.feelsLike}°
        </p>
        <div className="hero-stats">
          <span><Droplets size={13} /> {today.humidity}%</span>
          <span><Wind size={13} /> {today.wind} km/h</span>
          <span><CloudRain size={13} /> {today.rainChance}% rain</span>
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
        <h2>Next 24 Hours</h2>
      </div>
      <div className="hourly-scroll">
        {hourly.map((h, i) => (
          <div className={'hourly-card' + (i === 0 ? ' now' : '')} key={i}>
            <span className="hourly-time">{h.time}</span>
            <span className="hourly-icon">{h.icon}</span>
            <span className="hourly-temp">{h.temp}°</span>
            <span className="hourly-rain"><CloudRain size={10} /> {h.rain}%</span>
          </div>
        ))}
      </div>

      <div className="section-heading">
        <h2>{forecast.length}-Day Trend</h2>
      </div>
      <div className="trend-chart-card">
        <ResponsiveContainer width="100%" height={150}>
          <LineChart data={forecast} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#EEF1EE" />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#6B756E', fontFamily: 'Poppins' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#6B756E', fontFamily: 'Poppins' }} axisLine={false} tickLine={false} width={30} />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: '1px solid #E4E9E5', fontFamily: 'Poppins', fontSize: 12 }}
              formatter={(value, name) => [`${value}°C`, name === 'high' ? 'High' : 'Low']}
            />
            <Line type="monotone" dataKey="high" stroke="#E14B4B" strokeWidth={2.5} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="low" stroke="#2E7CD6" strokeWidth={2.5} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
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

      {airQuality && (
        <>
          <div className="section-heading">
            <h2>Air Quality</h2>
          </div>
          <div className="aqi-card">
            <div
              className="aqi-gauge"
              style={{ background: `conic-gradient(${airQuality.color} ${airQuality.aqi * 72}deg, #EDEFEA 0deg)` }}
            >
              <div className="aqi-gauge-inner">
                <strong>{airQuality.aqi}</strong>
                <span>/5</span>
              </div>
            </div>
            <div className="aqi-info">
              <span className="aqi-label" style={{ color: airQuality.color }}>{airQuality.label}</span>
              <div className="aqi-components">
                <span>PM2.5: {airQuality.pm2_5} µg/m³</span>
                <span>PM10: {airQuality.pm10} µg/m³</span>
                <span>O₃: {airQuality.o3} µg/m³</span>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="section-heading">
        <h2>Sun &amp; Moon</h2>
      </div>

      <div className="sun-arc-card">
        <div className="sun-arc-track">
          <div className="sun-arc-fill" style={{ width: `${dayPct}%` }} />
          <div className="sun-arc-marker" style={{ left: `${dayPct}%` }}>☀️</div>
        </div>
        <div className="sun-arc-labels">
          <div><Sunrise size={14} /> {today.sunrise}</div>
          <div><Sunset size={14} /> {today.sunset}</div>
        </div>
      </div>

      <div className="moon-card">
        <span className="moon-emoji">{moonPhase.emoji}</span>
        <div>
          <strong>{moonPhase.name}</strong>
          <p>{moonPhase.illumination}% illuminated</p>
        </div>
      </div>

      <div className="section-heading">
        <h2>More Details</h2>
      </div>
      <div className="detail-grid">
        <div className="detail-tile">
          <Gauge size={16} />
          <strong>{today.pressure}</strong>
          <span>hPa Pressure</span>
        </div>
        <div className="detail-tile">
          <Eye size={16} />
          <strong>{today.visibility ?? '—'}</strong>
          <span>km Visibility</span>
        </div>
        <div className="detail-tile">
          <Wind size={16} />
          <strong>{today.windDeg}°</strong>
          <span>Wind Direction</span>
        </div>
      </div>
    </div>
  )
}

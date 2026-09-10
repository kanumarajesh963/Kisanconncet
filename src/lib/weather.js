const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY
const BASE_URL = 'https://api.openweathermap.org/data/2.5'
const CACHE_KEY = 'kc_weather_cache_v2'
const GPS_CACHE_TTL_MS = 10 * 60 * 1000 // 10 minutes for a precise GPS result
const IP_CACHE_TTL_MS = 60 * 1000 // 1 minute for IP-based — retry GPS again soon

let memoryCache = null
let inFlightRequest = null

const ICON_MAP = {
  '01': '☀️', '02': '⛅', '03': '☁️', '04': '☁️',
  '09': '🌧️', '10': '🌦️', '11': '🌩️', '13': '❄️', '50': '🌫️',
}

const AQI_LEVELS = {
  1: { label: 'Good', color: '#1F8A45' },
  2: { label: 'Fair', color: '#7CB342' },
  3: { label: 'Moderate', color: '#F5A623' },
  4: { label: 'Poor', color: '#E8743B' },
  5: { label: 'Very Poor', color: '#E14B4B' },
}

function iconFor(owmIcon) {
  return ICON_MAP[owmIcon?.slice(0, 2)] || '⛅'
}

function dayLabel(dt, index) {
  if (index === 0) return 'Today'
  return new Date(dt * 1000).toLocaleDateString('en-US', { weekday: 'short' })
}

function getGpsCoords() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude, source: 'gps' }),
      (err) => reject(err),
      { timeout: 8000 }
    )
  })
}

async function getIpCoords() {
  const res = await fetch('https://ipapi.co/json/')
  if (!res.ok) throw new Error('IP location lookup failed')
  const data = await res.json()
  if (!data.latitude || !data.longitude) throw new Error('IP location lookup returned no coordinates')
  return {
    lat: data.latitude,
    lon: data.longitude,
    source: 'ip',
    label: [data.city, data.region].filter(Boolean).join(', '),
  }
}

async function resolveLocation() {
  try {
    return await getGpsCoords()
  } catch {
    return await getIpCoords()
  }
}

async function reverseGeocode(lat, lon) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=16&addressdetails=1`,
      { headers: { Accept: 'application/json' } }
    )
    if (!res.ok) return null
    const data = await res.json()
    const addr = data.address
    if (!addr) return null
    const locality =
      addr.suburb || addr.neighbourhood || addr.residential || addr.quarter ||
      addr.village || addr.town || addr.city_district || addr.city
    const city = addr.city || addr.town || addr.state_district
    if (locality && city && locality !== city) {
      return `${locality}, ${city}`
    }
    return locality || city || addr.state || null
  } catch {
    return null
  }
}

async function fetchAirQuality(lat, lon) {
  try {
    const res = await fetch(`${BASE_URL}/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`)
    if (!res.ok) return null
    const data = await res.json()
    const entry = data.list?.[0]
    if (!entry) return null
    const level = AQI_LEVELS[entry.main.aqi] || AQI_LEVELS[3]
    return {
      aqi: entry.main.aqi,
      label: level.label,
      color: level.color,
      pm2_5: Math.round(entry.components.pm2_5),
      pm10: Math.round(entry.components.pm10),
      o3: Math.round(entry.components.o3),
    }
  } catch {
    return null
  }
}

// Astronomically computed moon phase — not an API call, just math from the date.
function getMoonPhase(date) {
  const knownNewMoon = Date.UTC(2000, 0, 6, 18, 14, 0)
  const synodicMonth = 29.53058867
  const diffDays = (date.getTime() - knownNewMoon) / 86400000
  const age = ((diffDays % synodicMonth) + synodicMonth) % synodicMonth
  const p = age / synodicMonth
  const illumination = Math.round((1 - Math.cos(p * 2 * Math.PI)) / 2 * 100)

  let name, emoji
  if (p < 0.03 || p > 0.97) { name = 'New Moon'; emoji = '🌑' }
  else if (p < 0.22) { name = 'Waxing Crescent'; emoji = '🌒' }
  else if (p < 0.28) { name = 'First Quarter'; emoji = '🌓' }
  else if (p < 0.47) { name = 'Waxing Gibbous'; emoji = '🌔' }
  else if (p < 0.53) { name = 'Full Moon'; emoji = '🌕' }
  else if (p < 0.72) { name = 'Waning Gibbous'; emoji = '🌖' }
  else if (p < 0.78) { name = 'Last Quarter'; emoji = '🌗' }
  else { name = 'Waning Crescent'; emoji = '🌘' }

  return { name, emoji, illumination }
}

function ttlFor(data) {
  return data.today.locationSource === 'gps' ? GPS_CACHE_TTL_MS : IP_CACHE_TTL_MS
}

function readCache() {
  if (memoryCache && Date.now() - memoryCache.savedAt < ttlFor(memoryCache.data)) {
    return memoryCache.data
  }
  try {
    const raw = sessionStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (Date.now() - parsed.savedAt < ttlFor(parsed.data)) {
      memoryCache = parsed
      return parsed.data
    }
  } catch {
    // ignore corrupt cache
  }
  return null
}

function writeCache(data) {
  const entry = { data, savedAt: Date.now() }
  memoryCache = entry
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(entry))
  } catch {
    // storage full or unavailable — memory cache still works
  }
}

export async function getLocationLabel() {
  try {
    const data = await fetchWeatherData()
    return data.today.location
  } catch {
    return null
  }
}

export async function fetchWeatherData({ force = false } = {}) {
  if (!force) {
    const cached = readCache()
    if (cached) return cached
  }

  if (inFlightRequest) return inFlightRequest

  inFlightRequest = fetchWeatherDataUncached()
    .then((data) => {
      writeCache(data)
      inFlightRequest = null
      return data
    })
    .catch((err) => {
      inFlightRequest = null
      throw err
    })

  return inFlightRequest
}

async function fetchWeatherDataUncached() {
  if (!API_KEY) {
    throw new Error('Weather API key not configured')
  }

  const { lat, lon, source, label } = await resolveLocation()

  const [currentRes, forecastRes, locationName, airQuality] = await Promise.all([
    fetch(`${BASE_URL}/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`),
    fetch(`${BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`),
    source === 'gps' ? reverseGeocode(lat, lon) : Promise.resolve(label),
    fetchAirQuality(lat, lon),
  ])

  const coordsLabel =
    `${Math.abs(lat).toFixed(4)}°${lat >= 0 ? 'N' : 'S'}, ${Math.abs(lon).toFixed(4)}°${lon >= 0 ? 'E' : 'W'}`

  if (!currentRes.ok || !forecastRes.ok) {
    const status = !currentRes.ok ? currentRes.status : forecastRes.status
    throw new Error(`Weather API returned ${status}`)
  }

  const current = await currentRes.json()
  const forecast = await forecastRes.json()

  const byDay = {}
  forecast.list.forEach((entry) => {
    const dateKey = new Date(entry.dt * 1000).toISOString().slice(0, 10)
    if (!byDay[dateKey]) byDay[dateKey] = []
    byDay[dateKey].push(entry)
  })

  const days = Object.entries(byDay)
    .slice(0, 6)
    .map(([, entries], index) => {
      const temps = entries.map((e) => e.main.temp)
      const pops = entries.map((e) => e.pop || 0)
      const midday =
        entries.find((e) => new Date(e.dt * 1000).getHours() === 12) || entries[Math.floor(entries.length / 2)]
      return {
        day: dayLabel(entries[0].dt, index),
        icon: iconFor(midday.weather[0].icon),
        high: Math.round(Math.max(...temps)),
        low: Math.round(Math.min(...temps)),
        rain: Math.round(Math.max(...pops) * 100),
      }
    })

  const hourly = forecast.list.slice(0, 8).map((e, i) => ({
    time: i === 0 ? 'Now' : new Date(e.dt * 1000).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }),
    icon: iconFor(e.weather[0].icon),
    temp: Math.round(e.main.temp),
    rain: Math.round((e.pop || 0) * 100),
  }))

  const next24h = forecast.list.slice(0, 8)
  const maxRainChance = Math.round(Math.max(...next24h.map((e) => e.pop || 0)) * 100)
  const avgWind = Math.round(current.wind.speed * 3.6)

  let alert = null
  const rainySlot = next24h.find((e) => (e.pop || 0) >= 0.5)
  if (rainySlot) {
    const slotDate = new Date(rainySlot.dt * 1000)
    const today = new Date()
    const isToday = slotDate.toDateString() === today.toDateString()
    const isTomorrow =
      slotDate.toDateString() === new Date(today.getTime() + 86400000).toDateString()
    const dayWord = isToday ? 'today' : isTomorrow ? 'tomorrow' : slotDate.toLocaleDateString('en-US', { weekday: 'long' })
    const when = slotDate.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true })
    alert = {
      type: 'rain',
      message: `Rain likely ${dayWord} around ${when} — plan spraying and irrigation accordingly.`,
    }
  }

  const sprayOk = maxRainChance < 40 && avgWind < 20
  const sprayAdvisory = {
    status: sprayOk ? 'recommended' : 'not-recommended',
    message: sprayOk
      ? 'Low wind and low rain chance — safe conditions for spraying today.'
      : maxRainChance >= 40
      ? 'Rain expected within 24h — avoid spraying today.'
      : 'Wind speed too high for effective, drift-free spraying.',
  }

  const fmtTime = (unixSeconds) =>
    new Date(unixSeconds * 1000).toLocaleTimeString('en-US', {
      hour: 'numeric', minute: '2-digit', hour12: true,
    })

  const nowSec = Date.now() / 1000
  const dayProgress = Math.min(
    1,
    Math.max(0, (nowSec - current.sys.sunrise) / (current.sys.sunset - current.sys.sunrise))
  )

  return {
    today: {
      location: locationName || 'Unknown location',
      coordsLabel,
      locationSource: source,
      temp: Math.round(current.main.temp),
      feelsLike: Math.round(current.main.feels_like),
      condition: current.weather[0].main,
      icon: iconFor(current.weather[0].icon),
      humidity: current.main.humidity,
      wind: avgWind,
      windDeg: current.wind.deg,
      pressure: current.main.pressure,
      visibility: current.visibility != null ? (current.visibility / 1000).toFixed(1) : null,
      rainChance: maxRainChance,
      alert,
      sunrise: fmtTime(current.sys.sunrise),
      sunset: fmtTime(current.sys.sunset),
      dayProgress,
    },
    forecast: days,
    hourly,
    airQuality,
    moonPhase: getMoonPhase(new Date()),
    sprayAdvisory,
  }
}

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY
const BASE_URL = 'https://api.openweathermap.org/data/2.5'
const CACHE_KEY = 'kc_weather_cache_v1'
const CACHE_TTL_MS = 10 * 60 * 1000 // 10 minutes for a real GPS-based result
const FALLBACK_CACHE_TTL_MS = 20 * 1000 // 20 seconds when location fell back — retry soon

let memoryCache = null
let inFlightRequest = null

// Fallback location when live GPS isn't available: Hyderabad, Telangana
const LAT = 17.385
const LON = 78.4867
const FALLBACK_LABEL = 'Hyderabad, Telangana'

const ICON_MAP = {
  '01': '☀️', '02': '⛅', '03': '☁️', '04': '☁️',
  '09': '🌧️', '10': '🌦️', '11': '🌩️', '13': '❄️', '50': '🌫️',
}

function iconFor(owmIcon) {
  return ICON_MAP[owmIcon?.slice(0, 2)] || '⛅'
}

function dayLabel(dt, index) {
  if (index === 0) return 'Today'
  return new Date(dt * 1000).toLocaleDateString('en-US', { weekday: 'short' })
}

export function getCurrentCoords() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({ lat: LAT, lon: LON, isLive: false })
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude, isLive: true }),
      () => resolve({ lat: LAT, lon: LON, isLive: false }),
      { timeout: 8000 }
    )
  })
}

async function reverseGeocode(lat, lon) {
  try {
    const res = await fetch(
      `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`
    )
    if (!res.ok) return null
    const [place] = await res.json()
    if (!place) return null
    return [place.name, place.state].filter(Boolean).join(', ')
  } catch {
    return null
  }
}

function ttlFor(data) {
  return data.today.isLiveLocation ? CACHE_TTL_MS : FALLBACK_CACHE_TTL_MS
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

export async function fetchWeatherData() {
  const cached = readCache()
  if (cached) return cached

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

  const { lat, lon, isLive } = await getCurrentCoords()

  const [currentRes, forecastRes, locationName] = await Promise.all([
    fetch(`${BASE_URL}/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`),
    fetch(`${BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`),
    isLive ? reverseGeocode(lat, lon) : Promise.resolve(FALLBACK_LABEL),
  ])

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

  const next24h = forecast.list.slice(0, 8)
  const maxRainChance = Math.round(Math.max(...next24h.map((e) => e.pop || 0)) * 100)
  const avgWind = Math.round(current.wind.speed * 3.6)

  let alert = null
  const rainySlot = next24h.find((e) => (e.pop || 0) >= 0.5)
  if (rainySlot) {
    const when = new Date(rainySlot.dt * 1000).toLocaleTimeString('en-US', {
      hour: 'numeric', hour12: true,
    })
    alert = {
      type: 'rain',
      message: `Rain likely around ${when} — plan spraying and irrigation accordingly.`,
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

  return {
    today: {
      location: locationName || FALLBACK_LABEL,
      isLiveLocation: isLive,
      temp: Math.round(current.main.temp),
      condition: current.weather[0].main,
      icon: iconFor(current.weather[0].icon),
      humidity: current.main.humidity,
      wind: avgWind,
      rainChance: maxRainChance,
      alert,
      sunrise: fmtTime(current.sys.sunrise),
      sunset: fmtTime(current.sys.sunset),
    },
    forecast: days,
    sprayAdvisory,
  }
}

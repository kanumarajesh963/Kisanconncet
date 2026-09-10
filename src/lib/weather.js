const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY
const BASE_URL = 'https://api.openweathermap.org/data/2.5'
const CACHE_KEY = 'kc_weather_cache_v1'
const GPS_CACHE_TTL_MS = 10 * 60 * 1000 // 10 minutes for a precise GPS result
const IP_CACHE_TTL_MS = 60 * 1000 // 1 minute for IP-based — retry GPS again soon

let memoryCache = null
let inFlightRequest = null

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

  const { lat, lon, source, label } = await resolveLocation()

  const [currentRes, forecastRes, locationName] = await Promise.all([
    fetch(`${BASE_URL}/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`),
    fetch(`${BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`),
    source === 'gps' ? reverseGeocode(lat, lon) : Promise.resolve(label),
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

  return {
    today: {
      location: locationName || 'Unknown location',
      coordsLabel,
      locationSource: source,
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

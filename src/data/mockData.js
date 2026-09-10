export const user = {
  name: 'Rajesh Kanuma',
  phone: '+91 98765 43210',
  farmSize: '3.2 acres',
  crops: ['Sugarcane', 'Onion', 'Soybean'],
}

export const weatherToday = {
  location: 'Shirwal, Satara',
  temp: 31,
  condition: 'Partly Cloudy',
  humidity: 62,
  wind: 14,
  rainChance: 40,
  alert: {
    type: 'rain',
    message: 'Moderate rain expected tomorrow evening. Delay pesticide spray.',
  },
}

export const weatherForecast = [
  { day: 'Today', icon: '⛅', high: 31, low: 23, rain: 40 },
  { day: 'Tue', icon: '🌧️', high: 27, low: 22, rain: 80 },
  { day: 'Wed', icon: '🌦️', high: 28, low: 22, rain: 55 },
  { day: 'Thu', icon: '☀️', high: 32, low: 24, rain: 10 },
  { day: 'Fri', icon: '☀️', high: 33, low: 24, rain: 5 },
  { day: 'Sat', icon: '⛅', high: 30, low: 23, rain: 30 },
  { day: 'Sun', icon: '🌩️', high: 26, low: 21, rain: 70 },
]

export const sprayAdvisory = {
  status: 'not-recommended',
  message: 'Wind speed high & rain expected within 24h — avoid spraying today.',
}

export const mandiPrices = [
  {
    crop: 'Onion',
    unit: 'per quintal',
    markets: [
      { name: 'Shirwal Mandi', price: 1850, distance: '3 km', trend: 'up' },
      { name: 'Satara APMC', price: 1980, distance: '18 km', trend: 'up' },
      { name: 'Pune Market Yard', price: 2100, distance: '52 km', trend: 'down' },
    ],
  },
  {
    crop: 'Sugarcane',
    unit: 'per tonne',
    markets: [
      { name: 'Shirwal Mandi', price: 3050, distance: '3 km', trend: 'flat' },
      { name: 'Satara APMC', price: 3120, distance: '18 km', trend: 'up' },
    ],
  },
  {
    crop: 'Soybean',
    unit: 'per quintal',
    markets: [
      { name: 'Satara APMC', price: 4450, distance: '18 km', trend: 'up' },
      { name: 'Pune Market Yard', price: 4520, distance: '52 km', trend: 'up' },
    ],
  },
]

export const priceTrend = [
  { day: 'Mon', price: 1780 },
  { day: 'Tue', price: 1820 },
  { day: 'Wed', price: 1790 },
  { day: 'Thu', price: 1860 },
  { day: 'Fri', price: 1900 },
  { day: 'Sat', price: 1950 },
  { day: 'Sun', price: 2100 },
]

export const motorStatus = {
  isOn: false,
  name: 'Borewell Motor 1',
  lastRun: 'Today, 6:12 AM – 7:45 AM',
  powerSource: 'Grid Power',
  dryRunProtection: true,
  waterLevel: 'Normal',
  schedule: [
    { time: '6:00 AM', duration: '90 min', days: 'Mon, Wed, Fri', active: true },
    { time: '5:30 PM', duration: '45 min', days: 'Daily', active: false },
  ],
}

export const cropCalendar = [
  {
    crop: 'Onion',
    stage: 'Bulb Formation',
    plantedOn: '12 Jul 2026',
    tasks: [
      { task: 'Irrigation (light)', date: '10 Sep', status: 'upcoming' },
      { task: 'Apply Potash fertilizer', date: '12 Sep', status: 'upcoming' },
      { task: 'Weeding', date: '15 Sep', status: 'upcoming' },
      { task: 'Pest inspection', date: '05 Sep', status: 'done' },
    ],
  },
  {
    crop: 'Sugarcane',
    stage: 'Tillering',
    plantedOn: '02 Mar 2026',
    tasks: [
      { task: 'Nitrogen top dressing', date: '11 Sep', status: 'upcoming' },
      { task: 'Earthing up', date: '20 Sep', status: 'upcoming' },
      { task: 'Irrigation', date: '03 Sep', status: 'done' },
    ],
  },
]

export const cropDoctorHistory = [
  {
    id: 1,
    crop: 'Onion',
    date: '02 Sep 2026',
    diagnosis: 'Purple Blotch (Alternaria porri)',
    confidence: 92,
    severity: 'Moderate',
    image: '🧅',
  },
  {
    id: 2,
    crop: 'Soybean',
    date: '28 Aug 2026',
    diagnosis: 'Healthy — no disease detected',
    confidence: 97,
    severity: 'None',
    image: '🌱',
  },
]

export const nearbyStores = [
  { name: 'Krishi Seva Kendra', distance: '2.1 km', rating: 4.5 },
  { name: 'Shirwal Agro Center', distance: '3.4 km', rating: 4.2 },
  { name: 'New Farmers Agency', distance: '5.8 km', rating: 4.0 },
]

export const marketplaceListings = [
  {
    id: 1,
    crop: 'Onion',
    quantity: '2500 kg',
    pricePerKg: 21,
    seller: 'Vikas Jadhav',
    village: 'Shirwal',
    bids: 4,
    highestBid: 22.5,
    image: '🧅',
  },
  {
    id: 2,
    crop: 'Tomato',
    quantity: '900 kg',
    pricePerKg: 14,
    seller: 'Sunita More',
    village: 'Nira',
    bids: 2,
    highestBid: 14.5,
    image: '🍅',
  },
  {
    id: 3,
    crop: 'Soybean',
    quantity: '4000 kg',
    pricePerKg: 45,
    seller: 'Rajesh Kanuma',
    village: 'Anantapur',
    bids: 7,
    highestBid: 46.8,
    image: '🌱',
  },
]

export const communityPosts = [
  {
    id: 1,
    author: 'Anil Deshmukh',
    village: 'Baramati',
    time: '2h ago',
    title: 'Best fertilizer schedule for onion bulb stage?',
    replies: 12,
    likes: 8,
    tag: 'Q&A',
  },
  {
    id: 2,
    author: 'Dr. Sunanda Rao',
    village: 'Agri Expert',
    time: '5h ago',
    title: 'Live session tomorrow 5 PM: Managing whitefly in cotton',
    replies: 34,
    likes: 51,
    tag: 'Expert Session',
  },
  {
    id: 3,
    author: 'Prakash Salunkhe',
    village: 'Shirwal',
    time: '1d ago',
    title: 'Doubled my soybean yield this season — here is what I changed',
    replies: 21,
    likes: 64,
    tag: 'Success Story',
  },
]

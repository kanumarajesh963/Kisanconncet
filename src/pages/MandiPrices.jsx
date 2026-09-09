import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, MapPin, TrendingUp, TrendingDown, Minus, Star, Search,
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import { mandiPrices, priceTrend } from '../data/mockData.js'
import './MandiPrices.css'

const trendIcon = {
  up: <TrendingUp size={13} />,
  down: <TrendingDown size={13} />,
  flat: <Minus size={13} />,
}

export default function MandiPrices() {
  const navigate = useNavigate()
  const [activeCrop, setActiveCrop] = useState(mandiPrices[0].crop)

  const cropData = useMemo(
    () => mandiPrices.find((c) => c.crop === activeCrop),
    [activeCrop]
  )

  const bestMarket = useMemo(
    () => [...cropData.markets].sort((a, b) => b.price - a.price)[0],
    [cropData]
  )

  const sortedMarkets = useMemo(
    () => [...cropData.markets].sort((a, b) => b.price - a.price),
    [cropData]
  )

  return (
    <div className="mandi-page">
      <div className="mandi-header">
        <button className="cs-back" onClick={() => navigate('/home')}>
          <ArrowLeft size={18} />
        </button>
        <h1>Mandi Prices</h1>
      </div>

      <div className="mandi-search">
        <Search size={16} />
        <span>Search crop or market…</span>
      </div>

      <div className="crop-tabs">
        {mandiPrices.map((c) => (
          <button
            key={c.crop}
            className={'crop-tab' + (c.crop === activeCrop ? ' active' : '')}
            onClick={() => setActiveCrop(c.crop)}
          >
            {c.crop}
          </button>
        ))}
      </div>

      <div className="best-market-card">
        <div className="best-badge">
          <Star size={13} fill="currentColor" /> Best Price Nearby
        </div>
        <div className="best-main">
          <div>
            <h2>₹{bestMarket.price.toLocaleString('en-IN')}</h2>
            <span>{cropData.unit}</span>
          </div>
          <div className={'trend-chip ' + bestMarket.trend}>
            {trendIcon[bestMarket.trend]}
            {bestMarket.trend === 'up' ? 'Rising' : bestMarket.trend === 'down' ? 'Falling' : 'Stable'}
          </div>
        </div>
        <div className="best-location">
          <MapPin size={13} /> {bestMarket.name} · {bestMarket.distance}
        </div>
      </div>

      <div className="section-heading">
        <h2>7-Day Price Trend — {activeCrop}</h2>
      </div>

      <div className="trend-chart-card">
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={priceTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#EEF1EE" />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 11, fill: '#6B756E', fontFamily: 'Poppins' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#6B756E', fontFamily: 'Poppins' }}
              axisLine={false}
              tickLine={false}
              width={44}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: '1px solid #E4E9E5',
                fontFamily: 'Poppins',
                fontSize: 12,
              }}
              formatter={(value) => [`₹${value}`, 'Price']}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#1F8A45"
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#1F8A45' }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="section-heading">
        <h2>All Nearby Markets</h2>
      </div>

      <div className="market-list">
        {sortedMarkets.map((m, idx) => (
          <div className="market-row" key={m.name}>
            <div className="market-rank">{idx === 0 ? '🏆' : idx + 1}</div>
            <div className="market-info">
              <strong>{m.name}</strong>
              <p><MapPin size={12} /> {m.distance}</p>
            </div>
            <div className="market-price-block">
              <span className="market-price">₹{m.price.toLocaleString('en-IN')}</span>
              <span className={'trend-chip small ' + m.trend}>
                {trendIcon[m.trend]}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

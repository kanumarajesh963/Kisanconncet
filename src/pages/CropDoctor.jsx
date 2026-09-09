import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Camera, ImagePlus, Loader2, AlertCircle, Star, MapPin,
  RotateCcw, Sparkles,
} from 'lucide-react'
import { cropDoctorHistory, nearbyStores } from '../data/mockData.js'
import './CropDoctor.css'

const result = cropDoctorHistory[0]

const treatments = [
  'Remove and destroy severely infected leaves to stop spread',
  'Spray Mancozeb 75% WP @ 2.5g/litre of water, repeat after 10 days',
  'Ensure proper field drainage — avoid water stagnation',
  'Maintain 15-20 cm spacing between plants for better airflow',
]

export default function CropDoctor() {
  const navigate = useNavigate()
  const [stage, setStage] = useState('capture')
  const fileRef = useRef(null)

  const handleCapture = () => {
    setStage('analyzing')
    setTimeout(() => setStage('result'), 1800)
  }

  return (
    <div className="doctor-page">
      <div className="doctor-header">
        <button className="cs-back" onClick={() => navigate('/home')}>
          <ArrowLeft size={18} />
        </button>
        <h1>Crop Doctor (AI)</h1>
      </div>

      {stage === 'capture' && (
        <>
          <div className="doctor-hero">
            <div className="doctor-hero-icon"><Sparkles size={26} /></div>
            <h2>Diagnose crop issues instantly</h2>
            <p>Take a clear photo of the affected leaf, fruit or stem for an AI-powered diagnosis and treatment plan.</p>
          </div>

          <div className="capture-box" onClick={handleCapture}>
            <Camera size={30} />
            <strong>Take Photo</strong>
            <span>or upload from gallery</span>
          </div>

          <button className="upload-link" onClick={() => fileRef.current?.click()}>
            <ImagePlus size={15} /> Choose from Gallery
          </button>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleCapture} />

          <div className="section-heading history-heading">
            <h2>Recent Scans</h2>
          </div>
          <div className="history-list">
            {cropDoctorHistory.map((h) => (
              <div className="history-row" key={h.id}>
                <span className="history-emoji">{h.image}</span>
                <div className="history-info">
                  <strong>{h.diagnosis}</strong>
                  <p>{h.crop} · {h.date}</p>
                </div>
                <span className={'severity-chip ' + h.severity.toLowerCase()}>{h.severity}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {stage === 'analyzing' && (
        <div className="analyzing-box">
          <Loader2 size={36} className="spin" />
          <h2>Analyzing your photo…</h2>
          <p>Our AI model is checking for pests, disease patterns and nutrient deficiencies.</p>
        </div>
      )}

      {stage === 'result' && (
        <>
          <div className="result-card">
            <div className="result-image">🧅</div>
            <div className="result-badge">
              <AlertCircle size={13} /> {result.confidence}% confidence
            </div>
            <h2>{result.diagnosis}</h2>
            <span className={'severity-chip large ' + result.severity.toLowerCase()}>
              {result.severity} Severity
            </span>
          </div>

          <div className="section-heading">
            <h2>Recommended Treatment</h2>
          </div>
          <div className="treatment-list">
            {treatments.map((t, i) => (
              <div className="treatment-row" key={i}>
                <span className="treatment-num">{i + 1}</span>
                <p>{t}</p>
              </div>
            ))}
          </div>

          <div className="section-heading">
            <h2>Nearby Agri-Stores</h2>
          </div>
          <div className="store-list">
            {nearbyStores.map((s) => (
              <div className="store-row" key={s.name}>
                <div className="store-info">
                  <strong>{s.name}</strong>
                  <p><MapPin size={12} /> {s.distance}</p>
                </div>
                <div className="store-rating">
                  <Star size={13} fill="currentColor" /> {s.rating}
                </div>
              </div>
            ))}
          </div>

          <button className="rescan-btn" onClick={() => setStage('capture')}>
            <RotateCcw size={15} /> Scan Another Crop
          </button>
        </>
      )}
    </div>
  )
}

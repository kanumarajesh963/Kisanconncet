import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Calendar, Building2, X, CheckCircle2, Loader2, ClipboardCheck,
  LayoutGrid, Landmark, ShieldCheck, Banknote, GraduationCap,
} from 'lucide-react'
import { supabase } from '../lib/supabaseClient.js'
import { user } from '../data/mockData.js'
import './Schemes.css'

const categories = [
  { name: 'All', icon: LayoutGrid },
  { name: 'Subsidy', icon: Landmark },
  { name: 'Insurance', icon: ShieldCheck },
  { name: 'Loan', icon: Banknote },
  { name: 'Training', icon: GraduationCap },
]

const categoryColor = {
  Subsidy: 'subsidy',
  Insurance: 'insurance',
  Loan: 'loan',
  Training: 'training',
}

export default function Schemes() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('browse')
  const [category, setCategory] = useState('All')
  const [schemes, setSchemes] = useState([])
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [selected, setSelected] = useState(null)
  const [applying, setApplying] = useState(false)
  const [toast, setToast] = useState('')

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2200)
  }

  const load = useCallback(async () => {
    setLoading(true)
    const [{ data: schemeData, error: schemeError }, { data: appData }] = await Promise.all([
      supabase.from('govt_schemes').select('*').order('created_at', { ascending: true }),
      supabase
        .from('scheme_applications')
        .select('*, govt_schemes(name, category)')
        .eq('applicant_name', user.name)
        .order('created_at', { ascending: false }),
    ])
    if (schemeError) {
      setLoadError('Could not load schemes — check your connection')
    } else {
      setLoadError('')
      setSchemes(schemeData)
    }
    setApplications(appData || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const appliedIds = new Set(applications.map((a) => a.scheme_id))

  const visible = schemes.filter((s) => category === 'All' || s.category === category)

  const applyToScheme = async () => {
    setApplying(true)
    const { error } = await supabase
      .from('scheme_applications')
      .insert({ scheme_id: selected.id, applicant_name: user.name })
    setApplying(false)
    if (error) {
      showToast('Could not submit application — try again')
      return
    }
    showToast(`Applied to ${selected.name}`)
    setSelected(null)
    load()
  }

  return (
    <div className="schemes-page">
      <div className="schemes-header">
        <button className="cs-back" onClick={() => navigate('/home')}>
          <ArrowLeft size={18} />
        </button>
        <h1>Govt Schemes</h1>
      </div>

      <div className="market-tabs">
        <button className={'m-tab' + (tab === 'browse' ? ' active' : '')} onClick={() => setTab('browse')}>
          Browse Schemes
        </button>
        <button className={'m-tab' + (tab === 'applied' ? ' active' : '')} onClick={() => setTab('applied')}>
          My Applications {applications.length > 0 && `(${applications.length})`}
        </button>
      </div>

      {loading && (
        <div className="market-loading">
          <Loader2 size={22} className="spin" /> Loading schemes…
        </div>
      )}

      {!loading && loadError && (
        <div className="market-error">
          {loadError}
          <button onClick={load}>Retry</button>
        </div>
      )}

      {!loading && !loadError && tab === 'browse' && (
        <>
          <div className="scheme-filter-bar">
            <div className="scheme-cat-tabs">
              {categories.map(({ name, icon: Icon }) => (
                <button
                  key={name}
                  className={'scheme-cat-tab' + (category === name ? ' active' : '')}
                  onClick={() => setCategory(name)}
                >
                  <Icon size={19} strokeWidth={2.2} />
                  <span>{name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="scheme-list">
            {visible.map((s) => (
              <button className="scheme-card" key={s.id} onClick={() => setSelected(s)}>
                <div className="scheme-top">
                  <span className={'scheme-tag ' + categoryColor[s.category]}>{s.category}</span>
                  {appliedIds.has(s.id) && (
                    <span className="applied-badge"><CheckCircle2 size={12} /> Applied</span>
                  )}
                </div>
                <h3>{s.name}</h3>
                <p>{s.short_desc}</p>
                <div className="scheme-meta">
                  <span><Building2 size={12} /> {s.department}</span>
                  {s.deadline && <span><Calendar size={12} /> {s.deadline}</span>}
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {!loading && !loadError && tab === 'applied' && (
        applications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🏛️</div>
            <h2>No applications yet</h2>
            <p>Browse schemes and apply to the ones you're eligible for.</p>
          </div>
        ) : (
          <div className="scheme-list">
            {applications.map((a) => (
              <div className="applied-row" key={a.id}>
                <ClipboardCheck size={20} />
                <div>
                  <strong>{a.govt_schemes.name}</strong>
                  <p>{a.govt_schemes.category} · Status: {a.status}</p>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {selected && (
        <div className="bid-sheet-overlay" onClick={() => setSelected(null)}>
          <div className="bid-sheet scrollable" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-header">
              <h3>{selected.name}</h3>
              <button onClick={() => setSelected(null)}><X size={18} /></button>
            </div>
            <span className={'scheme-tag ' + categoryColor[selected.category]}>{selected.category}</span>

            <p className="scheme-detail-text">{selected.full_desc}</p>

            <div className="detail-block">
              <strong>Eligibility</strong>
              <p>{selected.eligibility}</p>
            </div>
            <div className="detail-block">
              <strong>Benefit</strong>
              <p>{selected.benefit}</p>
            </div>
            <div className="detail-block">
              <strong>Deadline</strong>
              <p>{selected.deadline || 'No fixed deadline'}</p>
            </div>
            <div className="detail-block">
              <strong>Department</strong>
              <p>{selected.department}</p>
            </div>

            {appliedIds.has(selected.id) ? (
              <div className="already-applied-note">
                <CheckCircle2 size={16} /> You've already applied to this scheme
              </div>
            ) : (
              <button className="confirm-bid-btn" onClick={applyToScheme} disabled={applying}>
                {applying ? 'Submitting…' : 'Apply for This Scheme'}
              </button>
            )}
          </div>
        </div>
      )}

      {toast && (
        <div className="toast">
          <CheckCircle2 size={15} /> {toast}
        </div>
      )}
    </div>
  )
}

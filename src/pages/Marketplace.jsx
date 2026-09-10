import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Plus, MapPin, Gavel, MessageCircle, X, Truck, Send, Trash2,
  CheckCircle2, Camera, LocateFixed, Loader2, Link2, Pencil,
} from 'lucide-react'
import { supabase } from '../lib/supabaseClient.js'
import { user } from '../data/mockData.js'
import { getLocationLabel } from '../lib/weather.js'
import './Marketplace.css'

const cropEmoji = {
  onion: '🧅', tomato: '🍅', soybean: '🌱', sugarcane: '🎋',
  wheat: '🌾', rice: '🌾', potato: '🥔',
}

const MAX_PHOTOS = 6

const emptyForm = { crop: '', quantity: '', price: '', photos: [], mapLink: '' }

export default function Marketplace() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('buy')
  const [listings, setListings] = useState([])
  const [loadingListings, setLoadingListings] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [selected, setSelected] = useState(null)
  const [bid, setBid] = useState('')
  const [placingBid, setPlacingBid] = useState(false)
  const [chatWith, setChatWith] = useState(null)
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [publishing, setPublishing] = useState(false)
  const [locating, setLocating] = useState(false)
  const [showLinkInput, setShowLinkInput] = useState(false)
  const [toast, setToast] = useState('')
  const [myLocation, setMyLocation] = useState('')
  const fileRef = useRef(null)

  useEffect(() => {
    getLocationLabel().then((loc) => setMyLocation(loc || ''))
  }, [])

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2200)
  }

  const fetchListings = useCallback(async () => {
    setLoadingListings(true)
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) {
      setLoadError('Could not load listings — check your connection')
    } else {
      setLoadError('')
      setListings(data)
    }
    setLoadingListings(false)
  }, [])

  useEffect(() => {
    fetchListings()
  }, [fetchListings])

  const myListings = listings.filter((l) => l.seller_name === user.name)
  const buyListings = listings.filter((l) => l.seller_name !== user.name)

  const openBid = (listing) => {
    setSelected(listing)
    setBid(String((listing.highest_bid || listing.price_per_kg) + 0.5))
  }

  const confirmBid = async () => {
    setPlacingBid(true)
    const amount = parseFloat(bid)
    const { error: bidError } = await supabase
      .from('bids')
      .insert({ listing_id: selected.id, bidder_name: user.name, amount })
    const { error: updateError } = await supabase
      .from('listings')
      .update({ highest_bid: amount, bid_count: selected.bid_count + 1 })
      .eq('id', selected.id)

    setPlacingBid(false)
    if (bidError || updateError) {
      showToast('Could not place bid — try again')
      return
    }
    setListings((prev) =>
      prev.map((l) =>
        l.id === selected.id ? { ...l, highest_bid: amount, bid_count: l.bid_count + 1 } : l
      )
    )
    showToast(`Bid of ₹${bid}/kg placed on ${selected.crop}`)
    setSelected(null)
  }

  const openChat = async (listing) => {
    setChatWith(listing)
    setChatMessages([])
    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('listing_id', listing.id)
      .order('created_at', { ascending: true })
    setChatMessages(data || [])
  }

  useEffect(() => {
    if (!chatWith) return
    const channel = supabase
      .channel(`chat-${chatWith.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `listing_id=eq.${chatWith.id}` },
        (payload) => setChatMessages((prev) => [...prev, payload.new])
      )
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [chatWith])

  const sendChat = async () => {
    if (!chatInput.trim() || !chatWith) return
    const message = chatInput.trim()
    setChatInput('')
    const { error } = await supabase
      .from('chat_messages')
      .insert({ listing_id: chatWith.id, sender_name: user.name, message })
    if (error) showToast('Message failed to send')
  }

  const handlePhotoSelect = (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    const room = MAX_PHOTOS - form.photos.length
    if (room <= 0) {
      showToast(`You can add up to ${MAX_PHOTOS} photos`)
      e.target.value = ''
      return
    }
    const toAdd = files.slice(0, room)
    if (files.length > room) {
      showToast(`Only ${room} more photo${room === 1 ? '' : 's'} could be added (max ${MAX_PHOTOS})`)
    }
    toAdd.forEach((file) => {
      const reader = new FileReader()
      reader.onload = () => setForm((f) => ({ ...f, photos: [...f.photos, reader.result] }))
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  const removePhoto = (idx) => {
    setForm((f) => ({ ...f, photos: f.photos.filter((_, i) => i !== idx) }))
  }

  const detectLocation = () => {
    if (!navigator.geolocation) {
      showToast('Location not supported on this device')
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        setForm((f) => ({
          ...f,
          mapLink: `https://www.google.com/maps?q=${latitude.toFixed(6)},${longitude.toFixed(6)}`,
        }))
        setLocating(false)
        showToast('Current location added')
      },
      () => {
        setLocating(false)
        showToast('Could not access location — paste a Google Maps link instead')
      },
      { timeout: 8000 }
    )
  }

  const submitListing = async (e) => {
    e.preventDefault()
    if (!form.crop || !form.quantity || !form.price) return
    if (!form.mapLink.trim()) {
      showToast('Pickup location is required')
      return
    }
    const key = form.crop.trim().toLowerCase()
    const price = parseFloat(form.price)
    setPublishing(true)
    const { data, error } = await supabase
      .from('listings')
      .insert({
        crop: form.crop.trim(),
        quantity: `${form.quantity} kg`,
        price_per_kg: price,
        seller_name: user.name,
        village: myLocation.split(',')[0] || 'Unknown location',
        map_link: form.mapLink.trim() || null,
        photos: form.photos,
        highest_bid: price,
        bid_count: 0,
      })
      .select()
      .single()
    setPublishing(false)

    if (error) {
      showToast('Could not publish listing — try again')
      return
    }
    setListings((prev) => [data, ...prev])
    setForm(emptyForm)
    setShowLinkInput(false)
    setShowAddForm(false)
    setTab('sell')
    showToast('Listing published successfully')
  }

  const closeAddForm = () => {
    setShowAddForm(false)
    setForm(emptyForm)
    setShowLinkInput(false)
  }

  const removeMyListing = async (id) => {
    const { error } = await supabase.from('listings').delete().eq('id', id)
    if (error) {
      showToast('Could not remove listing')
      return
    }
    setListings((prev) => prev.filter((l) => l.id !== id))
    showToast('Listing removed')
  }

  const renderThumb = (l) =>
    l.photos?.length > 0 ? (
      <div className="listing-photo-wrap">
        <img className="listing-photo" src={l.photos[0]} alt={l.crop} />
        {l.photos.length > 1 && <span className="photo-count-badge">+{l.photos.length - 1}</span>}
      </div>
    ) : (
      <span className="listing-emoji">{cropEmoji[l.crop.toLowerCase()] || '🌿'}</span>
    )

  return (
    <div className="market-page">
      <div className="market-header">
        <button className="cs-back" onClick={() => navigate('/home')}>
          <ArrowLeft size={18} />
        </button>
        <h1>Marketplace</h1>
        <button className="list-btn" onClick={() => setShowAddForm(true)}>
          <Plus size={15} /> List Produce
        </button>
      </div>

      <div className="market-tabs">
        <button className={'m-tab' + (tab === 'buy' ? ' active' : '')} onClick={() => setTab('buy')}>
          Browse Listings
        </button>
        <button className={'m-tab' + (tab === 'sell' ? ' active' : '')} onClick={() => setTab('sell')}>
          My Listings {myListings.length > 0 && `(${myListings.length})`}
        </button>
      </div>

      {loadingListings && (
        <div className="market-loading">
          <Loader2 size={22} className="spin" /> Loading listings…
        </div>
      )}

      {!loadingListings && loadError && (
        <div className="market-error">
          {loadError}
          <button onClick={fetchListings}>Retry</button>
        </div>
      )}

      {!loadingListings && !loadError && tab === 'buy' && (
        buyListings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🌾</div>
            <h2>No listings yet</h2>
            <p>Be the first to list your produce, or check back soon.</p>
          </div>
        ) : (
          <div className="listing-list">
            {buyListings.map((l) => (
              <div className="listing-card" key={l.id}>
                <div className="listing-top">
                  {renderThumb(l)}
                  <div className="listing-main">
                    <strong>{l.crop} · {l.quantity}</strong>
                    <p><MapPin size={12} /> {l.seller_name}, {l.village}</p>
                  </div>
                  <div className="listing-price">
                    <span>₹{l.price_per_kg}/kg</span>
                  </div>
                </div>
                <div className="listing-bottom">
                  <div className="bid-info">
                    <Gavel size={13} />
                    <span>{l.bid_count} bids · Highest ₹{l.highest_bid}/kg</span>
                  </div>
                  <div className="listing-actions">
                    <button className="icon-btn" onClick={() => openChat(l)} title="Chat with seller">
                      <MessageCircle size={15} />
                    </button>
                    <button className="bid-btn" onClick={() => openBid(l)}>Place Bid</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {!loadingListings && !loadError && tab === 'sell' && (
        myListings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🌾</div>
            <h2>No active listings</h2>
            <p>List your produce to reach verified buyers and logistics partners nearby.</p>
            <button className="list-btn full" onClick={() => setShowAddForm(true)}>
              <Plus size={15} /> List Your Produce
            </button>
          </div>
        ) : (
          <div className="listing-list">
            {myListings.map((l) => (
              <div className="listing-card" key={l.id}>
                <div className="listing-top">
                  {renderThumb(l)}
                  <div className="listing-main">
                    <strong>{l.crop} · {l.quantity}</strong>
                    <p><MapPin size={12} /> {l.village}</p>
                  </div>
                  <div className="listing-price">
                    <span>₹{l.price_per_kg}/kg</span>
                  </div>
                </div>
                <div className="listing-bottom">
                  <div className="bid-info">
                    <Gavel size={13} />
                    <span>{l.bid_count} bids so far</span>
                  </div>
                  <div className="listing-actions">
                    {l.map_link && (
                      <a className="icon-btn" href={l.map_link} target="_blank" rel="noreferrer" title="View on map">
                        <MapPin size={15} />
                      </a>
                    )}
                    <button className="icon-btn danger" onClick={() => removeMyListing(l.id)} title="Remove listing">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {showAddForm && (
        <div className="bid-sheet-overlay" onClick={closeAddForm}>
          <form className="bid-sheet scrollable" onClick={(e) => e.stopPropagation()} onSubmit={submitListing}>
            <div className="sheet-header">
              <h3>List Your Produce</h3>
              <button type="button" onClick={closeAddForm}><X size={18} /></button>
            </div>
            <p className="sheet-sub">This will be visible to verified buyers nearby</p>

            <label className="bid-label">Photos ({form.photos.length}/{MAX_PHOTOS})</label>
            {form.photos.length === 0 ? (
              <div className="photo-upload-box" onClick={() => fileRef.current?.click()}>
                <Camera size={22} />
                <span>Tap to add photos — select multiple at once</span>
              </div>
            ) : (
              <div className="photo-strip">
                {form.photos.map((p, i) => (
                  <div className="photo-thumb" key={i}>
                    <img src={p} alt={`Upload ${i + 1}`} />
                    <button type="button" className="photo-remove-btn" onClick={() => removePhoto(i)}>
                      <X size={12} />
                    </button>
                  </div>
                ))}
                {form.photos.length < MAX_PHOTOS && (
                  <button type="button" className="photo-add-tile" onClick={() => fileRef.current?.click()}>
                    <Plus size={18} />
                  </button>
                )}
              </div>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={handlePhotoSelect}
            />

            <label className="bid-label">Crop Name</label>
            <input
              className="form-text-input"
              placeholder="e.g. Onion"
              value={form.crop}
              onChange={(e) => setForm({ ...form, crop: e.target.value })}
              required
            />

            <label className="bid-label">Quantity (kg)</label>
            <input
              className="form-text-input"
              type="number"
              placeholder="e.g. 1000"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              required
            />

            <label className="bid-label">Price per kg (₹)</label>
            <div className="bid-input">
              <span>₹</span>
              <input
                type="number"
                step="0.5"
                placeholder="0"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                required
              />
            </div>

            <label className="bid-label">Pickup Location *</label>

            {form.mapLink ? (
              <div className="location-set-card">
                <div className="location-set-icon"><CheckCircle2 size={18} /></div>
                <div className="location-set-info">
                  <strong>Location added</strong>
                  <a href={form.mapLink} target="_blank" rel="noreferrer">View on Google Maps</a>
                </div>
                <button
                  type="button"
                  className="location-change-btn"
                  onClick={() => {
                    setForm((f) => ({ ...f, mapLink: '' }))
                    setShowLinkInput(false)
                  }}
                >
                  <Pencil size={13} /> Change
                </button>
              </div>
            ) : showLinkInput ? (
              <div className="location-row">
                <input
                  className="form-text-input location-text"
                  placeholder="Paste Google Maps link here"
                  value={form.mapLink}
                  onChange={(e) => setForm({ ...form, mapLink: e.target.value })}
                  autoFocus
                />
                <button type="button" className="locate-btn" onClick={() => setShowLinkInput(false)}>
                  <X size={16} />
                </button>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  className="locate-main-btn"
                  onClick={detectLocation}
                  disabled={locating}
                >
                  {locating ? <Loader2 size={16} className="spin" /> : <LocateFixed size={16} />}
                  {locating ? 'Detecting your location…' : 'Use Current Location'}
                </button>
                <button type="button" className="paste-link-btn" onClick={() => setShowLinkInput(true)}>
                  <Link2 size={13} /> Or paste a Google Maps link instead
                </button>
              </>
            )}

            <button type="submit" className="confirm-bid-btn" disabled={publishing}>
              {publishing ? 'Publishing…' : 'Publish Listing'}
            </button>
          </form>
        </div>
      )}

      {selected && (
        <div className="bid-sheet-overlay" onClick={() => setSelected(null)}>
          <div className="bid-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-header">
              <h3>Place Your Bid</h3>
              <button onClick={() => setSelected(null)}><X size={18} /></button>
            </div>
            <p className="sheet-sub">{selected.crop} · {selected.quantity} · {selected.seller_name}</p>

            <label className="bid-label">Your Offer (per kg)</label>
            <div className="bid-input">
              <span>₹</span>
              <input
                type="number"
                value={bid}
                onChange={(e) => setBid(e.target.value)}
                step="0.5"
              />
            </div>
            <p className="sheet-hint">Current highest bid: ₹{selected.highest_bid}/kg</p>

            <div className="logistics-note">
              <Truck size={15} />
              <span>Free pickup by verified logistics partner if bid is accepted</span>
            </div>

            <button className="confirm-bid-btn" onClick={confirmBid} disabled={placingBid}>
              {placingBid ? 'Placing Bid…' : `Confirm Bid — ₹${bid}/kg`}
            </button>
          </div>
        </div>
      )}

      {chatWith && (
        <div className="bid-sheet-overlay" onClick={() => setChatWith(null)}>
          <div className="chat-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-header">
              <div>
                <h3>{chatWith.seller_name}</h3>
                <p className="sheet-sub tight">{chatWith.crop} · {chatWith.quantity}</p>
              </div>
              <button onClick={() => setChatWith(null)}><X size={18} /></button>
            </div>
            <div className="chat-body">
              {chatMessages.length === 0 && (
                <p className="chat-empty">Say hello to start the conversation</p>
              )}
              {chatMessages.map((m) => (
                <div
                  key={m.id}
                  className={'chat-bubble ' + (m.sender_name === user.name ? 'me' : 'them')}
                >
                  {m.message}
                </div>
              ))}
            </div>
            <div className="chat-input-row">
              <input
                placeholder="Type a message…"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendChat()}
              />
              <button onClick={sendChat}><Send size={16} /></button>
            </div>
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

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, MessageCircle, Heart, Plus, GraduationCap, HelpCircle, Trophy,
} from 'lucide-react'
import { communityPosts } from '../data/mockData.js'
import './Community.css'

const tagStyle = {
  'Q&A': { icon: HelpCircle, className: 'qa' },
  'Expert Session': { icon: GraduationCap, className: 'expert' },
  'Success Story': { icon: Trophy, className: 'success' },
}

const filters = ['All', 'Q&A', 'Expert Session', 'Success Story']

export default function Community() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState('All')
  const [likes, setLikes] = useState(
    Object.fromEntries(communityPosts.map((p) => [p.id, p.likes]))
  )
  const [liked, setLiked] = useState({})

  const toggleLike = (id) => {
    setLiked((prev) => {
      const next = { ...prev, [id]: !prev[id] }
      setLikes((l) => ({ ...l, [id]: l[id] + (next[id] ? 1 : -1) }))
      return next
    })
  }

  const visible = communityPosts.filter((p) => filter === 'All' || p.tag === filter)

  return (
    <div className="community-page">
      <div className="community-header">
        <button className="cs-back" onClick={() => navigate('/home')}>
          <ArrowLeft size={18} />
        </button>
        <h1>Community</h1>
        <button className="new-post-btn"><Plus size={16} /></button>
      </div>

      <div className="filter-row">
        {filters.map((f) => (
          <button
            key={f}
            className={'filter-chip' + (filter === f ? ' active' : '')}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="post-list">
        {visible.map((p) => {
          const meta = tagStyle[p.tag]
          const Icon = meta.icon
          return (
            <div className="post-card" key={p.id}>
              <div className="post-top">
                <div className="post-avatar">{p.author.charAt(0)}</div>
                <div className="post-author">
                  <strong>{p.author}</strong>
                  <span>{p.village} · {p.time}</span>
                </div>
                <span className={'post-tag ' + meta.className}>
                  <Icon size={11} /> {p.tag}
                </span>
              </div>
              <p className="post-title">{p.title}</p>
              <div className="post-actions">
                <button
                  className={'action-btn' + (liked[p.id] ? ' liked' : '')}
                  onClick={() => toggleLike(p.id)}
                >
                  <Heart size={15} fill={liked[p.id] ? 'currentColor' : 'none'} />
                  {likes[p.id]}
                </button>
                <button className="action-btn">
                  <MessageCircle size={15} />
                  {p.replies}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, MessageCircle, Heart, Plus, GraduationCap, HelpCircle, Trophy,
  X, Send, Loader2,
} from 'lucide-react'
import { supabase } from '../lib/supabaseClient.js'
import { user } from '../data/mockData.js'
import './Community.css'

const tagStyle = {
  'Q&A': { icon: HelpCircle, className: 'qa' },
  'Expert Session': { icon: GraduationCap, className: 'expert' },
  'Success Story': { icon: Trophy, className: 'success' },
}

const filters = ['All', 'Q&A', 'Expert Session', 'Success Story']

function timeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export default function Community() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState('All')
  const [posts, setPosts] = useState([])
  const [likedIds, setLikedIds] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [showNewPost, setShowNewPost] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newTag, setNewTag] = useState('Q&A')
  const [posting, setPosting] = useState(false)
  const [replyPost, setReplyPost] = useState(null)
  const [replies, setReplies] = useState([])
  const [replyInput, setReplyInput] = useState('')

  const loadPosts = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('forum_posts')
      .select('*, forum_likes(count), forum_replies(count)')
      .order('created_at', { ascending: false })

    if (error) {
      setLoadError('Could not load posts — check your connection')
      setLoading(false)
      return
    }

    const { data: myLikes } = await supabase
      .from('forum_likes')
      .select('post_id')
      .eq('user_name', user.name)

    setLikedIds(new Set((myLikes || []).map((l) => l.post_id)))
    setLoadError('')
    setPosts(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    loadPosts()
  }, [loadPosts])

  const toggleLike = async (post) => {
    const isLiked = likedIds.has(post.id)
    setLikedIds((prev) => {
      const next = new Set(prev)
      isLiked ? next.delete(post.id) : next.add(post.id)
      return next
    })
    setPosts((prev) =>
      prev.map((p) =>
        p.id === post.id
          ? {
              ...p,
              forum_likes: [{ count: p.forum_likes[0].count + (isLiked ? -1 : 1) }],
            }
          : p
      )
    )
    if (isLiked) {
      await supabase.from('forum_likes').delete().eq('post_id', post.id).eq('user_name', user.name)
    } else {
      await supabase.from('forum_likes').insert({ post_id: post.id, user_name: user.name })
    }
  }

  const submitPost = async (e) => {
    e.preventDefault()
    if (!newTitle.trim()) return
    setPosting(true)
    const { data, error } = await supabase
      .from('forum_posts')
      .insert({
        author_name: user.name,
        village: user.village.split(',')[0],
        tag: newTag,
        title: newTitle.trim(),
      })
      .select('*, forum_likes(count), forum_replies(count)')
      .single()
    setPosting(false)
    if (error) return
    setPosts((prev) => [data, ...prev])
    setNewTitle('')
    setNewTag('Q&A')
    setShowNewPost(false)
  }

  const openReplies = async (post) => {
    setReplyPost(post)
    const { data } = await supabase
      .from('forum_replies')
      .select('*')
      .eq('post_id', post.id)
      .order('created_at', { ascending: true })
    setReplies(data || [])
  }

  const sendReply = async () => {
    if (!replyInput.trim() || !replyPost) return
    const message = replyInput.trim()
    setReplyInput('')
    const { data, error } = await supabase
      .from('forum_replies')
      .insert({ post_id: replyPost.id, author_name: user.name, message })
      .select()
      .single()
    if (error) return
    setReplies((prev) => [...prev, data])
    setPosts((prev) =>
      prev.map((p) =>
        p.id === replyPost.id
          ? { ...p, forum_replies: [{ count: p.forum_replies[0].count + 1 }] }
          : p
      )
    )
  }

  const visible = posts.filter((p) => filter === 'All' || p.tag === filter)

  return (
    <div className="community-page">
      <div className="community-header">
        <button className="cs-back" onClick={() => navigate('/home')}>
          <ArrowLeft size={18} />
        </button>
        <h1>Community</h1>
        <button className="new-post-btn" onClick={() => setShowNewPost(true)}>
          <Plus size={16} />
        </button>
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

      {loading && (
        <div className="market-loading">
          <Loader2 size={22} className="spin" /> Loading posts…
        </div>
      )}

      {!loading && loadError && (
        <div className="market-error">
          {loadError}
          <button onClick={loadPosts}>Retry</button>
        </div>
      )}

      {!loading && !loadError && (
        <div className="post-list">
          {visible.map((p) => {
            const meta = tagStyle[p.tag]
            const Icon = meta.icon
            const isLiked = likedIds.has(p.id)
            return (
              <div className="post-card" key={p.id}>
                <div className="post-top">
                  <div className="post-avatar">{p.author_name.charAt(0)}</div>
                  <div className="post-author">
                    <strong>{p.author_name}</strong>
                    <span>{p.village} · {timeAgo(p.created_at)}</span>
                  </div>
                  <span className={'post-tag ' + meta.className}>
                    <Icon size={11} /> {p.tag}
                  </span>
                </div>
                <p className="post-title">{p.title}</p>
                <div className="post-actions">
                  <button
                    className={'action-btn' + (isLiked ? ' liked' : '')}
                    onClick={() => toggleLike(p)}
                  >
                    <Heart size={15} fill={isLiked ? 'currentColor' : 'none'} />
                    {p.forum_likes[0]?.count || 0}
                  </button>
                  <button className="action-btn" onClick={() => openReplies(p)}>
                    <MessageCircle size={15} />
                    {p.forum_replies[0]?.count || 0}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showNewPost && (
        <div className="bid-sheet-overlay" onClick={() => setShowNewPost(false)}>
          <form className="bid-sheet" onClick={(e) => e.stopPropagation()} onSubmit={submitPost}>
            <div className="sheet-header">
              <h3>New Post</h3>
              <button type="button" onClick={() => setShowNewPost(false)}><X size={18} /></button>
            </div>

            <label className="bid-label">Category</label>
            <div className="filter-row" style={{ marginBottom: 16 }}>
              {filters.slice(1).map((f) => (
                <button
                  key={f}
                  type="button"
                  className={'filter-chip' + (newTag === f ? ' active' : '')}
                  onClick={() => setNewTag(f)}
                >
                  {f}
                </button>
              ))}
            </div>

            <label className="bid-label">Your Question or Update</label>
            <textarea
              className="form-text-input reply-textarea"
              placeholder="Share what's on your mind…"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              rows={3}
              required
            />

            <button type="submit" className="confirm-bid-btn" disabled={posting}>
              {posting ? 'Posting…' : 'Post to Community'}
            </button>
          </form>
        </div>
      )}

      {replyPost && (
        <div className="bid-sheet-overlay" onClick={() => setReplyPost(null)}>
          <div className="chat-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-header">
              <div>
                <h3>Replies</h3>
                <p className="sheet-sub tight">{replyPost.title}</p>
              </div>
              <button onClick={() => setReplyPost(null)}><X size={18} /></button>
            </div>
            <div className="chat-body">
              {replies.length === 0 && (
                <p className="chat-empty">No replies yet — be the first to respond</p>
              )}
              {replies.map((r) => (
                <div key={r.id} className={'chat-bubble ' + (r.author_name === user.name ? 'me' : 'them')}>
                  <strong className="reply-author">{r.author_name}</strong>
                  {r.message}
                </div>
              ))}
            </div>
            <div className="chat-input-row">
              <input
                placeholder="Write a reply…"
                value={replyInput}
                onChange={(e) => setReplyInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendReply()}
              />
              <button onClick={sendReply}><Send size={16} /></button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

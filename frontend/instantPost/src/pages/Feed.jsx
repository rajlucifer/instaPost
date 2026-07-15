import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import {
  Search, Heart, Share2, Download, Copy, LayoutGrid,
  AlertCircle, PlusCircle, X, ChevronLeft, ChevronRight,
  SlidersHorizontal, Sparkles, Trash2, Clock, ImageOff, ArrowUp, Flame,
  MessageCircle, Send, User, Eye
} from 'lucide-react';

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [likedPosts, setLikedPosts] = useState({});
  const [likeCounts, setLikeCounts] = useState({});
  const [viewCounts, setViewCounts] = useState({}); // { postId: Number }
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedTag, setSelectedTag] = useState(null);
  const [activeLightboxIndex, setActiveLightboxIndex] = useState(null);
  const [doubleTapPost, setDoubleTapPost] = useState(null); // { id, x, y }
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [comments, setComments] = useState({}); // { postId: [comment, ...] }
  const [commentText, setCommentText] = useState('');
  const [commentAuthor, setCommentAuthor] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const clickTimerRef = React.useRef(null);

  const navigate = useNavigate();
  const { showToast } = useToast();
  const { currentTheme } = useTheme();

  const timeAgo = (dateStr) => {
    if (!dateStr) return '';
    const secs = Math.floor((new Date() - new Date(dateStr)) / 1000);
    if (secs < 60) return 'just now';
    const mins = Math.floor(secs / 60);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
  };

  const allTags = React.useMemo(() => {
    const s = new Set();
    posts.forEach(p => p.tags?.forEach(t => s.add(t.toLowerCase())));
    return Array.from(s);
  }, [posts]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get("https://instapost-nb20.onrender.com/posts");
      const data = res.data.data || [];
      setPosts(data);
      const initialLikes = JSON.parse(localStorage.getItem('likedPosts') || '{}');
      setLikedPosts(initialLikes);
      const counts = {};
      const commentsMap = {};
      const views = {};
      data.forEach(p => {
        counts[p._id] = p.likes || 0;
        commentsMap[p._id] = p.comments || [];
        views[p._id] = p.views || 0;
      });
      setLikeCounts(counts);
      setComments(commentsMap);
      setViewCounts(views);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
      showToast('Failed to load feed posts', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Scroll-to-top visibility
  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Sync trending tags to localStorage for Sidebar
  useEffect(() => {
    if (posts.length === 0) return;
    const tagCount = {};
    posts.forEach(p => p.tags?.forEach(t => {
      const k = t.toLowerCase();
      tagCount[k] = (tagCount[k] || 0) + 1;
    }));
    const sorted = Object.entries(tagCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag]) => tag);
    localStorage.setItem('trendingTags', JSON.stringify(sorted));
  }, [posts]);

  const handleDoubleTap = (e, postId) => {
    e.stopPropagation();
    // Cancel any pending single-click (lightbox) action
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
      clickTimerRef.current = null;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setDoubleTapPost({ id: postId, x, y });
    // Auto-clear after animation finishes
    setTimeout(() => setDoubleTapPost(null), 800);
    // Trigger like only if not already liked
    if (!likedPosts[postId]) {
      toggleLike(postId);
    }
  };

  const handleImageClick = (postId) => {
    // Delay single-click so double-click can cancel it
    clickTimerRef.current = setTimeout(() => {
      clickTimerRef.current = null;
      openLightbox(postId);
    }, 250);
  };

  const toggleLike = async (postId) => {
    const was = !!likedPosts[postId];
    const next = { ...likedPosts, [postId]: !was };
    setLikedPosts(next);
    localStorage.setItem('likedPosts', JSON.stringify(next));
    setLikeCounts(prev => ({ ...prev, [postId]: prev[postId] + (was ? -1 : 1) }));
    if (!was) {
      showToast('Added to your favorites!', 'success');
      try { await axios.put(`https://instapost-nb20.onrender.com/posts/${postId}/like`); } catch {}
    }
  };

  const handleCopyCaption = (caption) => {
    navigator.clipboard.writeText(caption);
    showToast('Caption copied!', 'success');
  };

  const handleShare = (post) => {
    if (navigator.share) {
      navigator.share({ title: 'InstaPost', text: post.caption, url: post.image }).catch(console.error);
    } else {
      navigator.clipboard.writeText(post.image);
      showToast('Image URL copied!', 'success');
    }
  };

  const handleDownload = async (imageUrl, caption) => {
    try {
      const blob = await (await fetch(imageUrl)).blob();
      const url = URL.createObjectURL(blob);
      const a = Object.assign(document.createElement('a'), { href: url, download: `${caption.slice(0, 20).replace(/\s+/g, '-')}.jpg`, style: 'display:none' });
      document.body.appendChild(a); a.click(); URL.revokeObjectURL(url);
      showToast('Download started!', 'success');
    } catch {
      window.open(imageUrl, '_blank');
      showToast('Opening in new tab...', 'info');
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm("Delete this post?")) return;
    try {
      await axios.delete(`https://instapost-nb20.onrender.com/posts/${postId}`);
      setPosts(p => p.filter(x => x._id !== postId));
      showToast('Post deleted', 'success');
      if (activeLightboxIndex !== null) setActiveLightboxIndex(null);
    } catch {
      showToast('Failed to delete post', 'error');
    }
  };

  const handleAddComment = async (postId) => {
    if (!commentText.trim()) { showToast('Please write a comment', 'error'); return; }
    setCommentLoading(true);
    try {
      const res = await axios.post(
        `https://instapost-nb20.onrender.com/posts/${postId}/comment`,
        { text: commentText.trim(), author: commentAuthor.trim() || 'Anonymous' }
      );
      const newComment = res.data.data;
      setComments(prev => ({ ...prev, [postId]: [...(prev[postId] || []), newComment] }));
      setCommentText('');
      showToast('Comment added!', 'success');
    } catch {
      showToast('Failed to add comment', 'error');
    } finally {
      setCommentLoading(false);
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    try {
      await axios.delete(`https://instapost-nb20.onrender.com/posts/${postId}/comment/${commentId}`);
      setComments(prev => ({ ...prev, [postId]: (prev[postId] || []).filter(c => c._id !== commentId) }));
      showToast('Comment deleted', 'success');
    } catch {
      showToast('Failed to delete comment', 'error');
    }
  };

  const processedPosts = posts
    .filter(p => {
      const okSearch = p.caption.toLowerCase().includes(searchTerm.toLowerCase());
      const okFilter = filterType === 'liked' ? !!likedPosts[p._id] : true;
      const okTag = selectedTag ? p.tags?.some(t => t.toLowerCase() === selectedTag) : true;
      return okSearch && okFilter && okTag;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return b._id.localeCompare(a._id);
      if (sortBy === 'oldest') return a._id.localeCompare(b._id);
      if (sortBy === 'most-liked') return (likeCounts[b._id] || 0) - (likeCounts[a._id] || 0);
      if (sortBy === 'most-viewed') return (viewCounts[b._id] || 0) - (viewCounts[a._id] || 0);
      return 0;
    });

  useEffect(() => {
    const onKey = (e) => {
      if (activeLightboxIndex === null) return;
      if (e.key === 'Escape') setActiveLightboxIndex(null);
      if (e.key === 'ArrowRight') setActiveLightboxIndex(p => p < processedPosts.length - 1 ? p + 1 : 0);
      if (e.key === 'ArrowLeft')  setActiveLightboxIndex(p => p > 0 ? p - 1 : processedPosts.length - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeLightboxIndex, processedPosts]);

  const trackView = async (postId) => {
    // Optimistically update the local count
    setViewCounts(prev => ({ ...prev, [postId]: (prev[postId] || 0) + 1 }));
    try {
      await axios.put(`https://instapost-nb20.onrender.com/posts/${postId}/view`);
    } catch {
      // Silently fail — view tracking is non-critical
    }
  };

  const openLightbox = (postId) => {
    const idx = processedPosts.findIndex(p => p._id === postId);
    if (idx !== -1) {
      setActiveLightboxIndex(idx);
      trackView(postId);
    }
  };

  const lightboxPost = activeLightboxIndex !== null ? processedPosts[activeLightboxIndex] : null;

  return (
    <div className="min-h-screen px-5 sm:px-8 py-8 transition-colors duration-300">

      {/* ── Scroll to top button ───────────────────────── */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40
            flex items-center gap-2 px-4 py-2.5 rounded-full text-white text-xs font-bold
            shadow-2xl border border-white/20 backdrop-blur-md
            transition-all duration-300 hover:scale-110 active:scale-95 animate-slide-up"
          style={{ background: 'var(--gradient)' }}
        >
          <ArrowUp className="h-3.5 w-3.5" />
          Back to top
        </button>
      )}

      {/* ── Header ────────────────────────────────────── */}
      <div className="mb-8 animate-slide-up">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-4 w-4" style={{ color: 'var(--primary)' }} />
              <span className="text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: 'var(--primary)' }}>
                Community Gallery
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              Feed
            </h1>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
              {posts.length} {posts.length === 1 ? 'moment' : 'moments'} shared
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Storage pill */}
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl
              bg-white/60 dark:bg-slate-800/60 backdrop-blur
              border border-slate-200/50 dark:border-slate-700/50
              text-xs font-semibold text-slate-600 dark:text-slate-300">
              <span className={`h-2 w-2 rounded-full ${posts.length >= 15 ? 'bg-red-500' : 'bg-emerald-400'} animate-pulse`} />
              {posts.length} / 15 slots
            </div>
            {/* New post button */}
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-white text-sm font-bold
                shadow-lg glow-sm transition-all duration-300 hover:scale-105 active:scale-95"
              style={{ background: 'var(--gradient)' }}
            >
              <PlusCircle className="h-4 w-4" />
              <span className="hidden sm:inline">New Post</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Stats Bar ─────────────────────────────────── */}
      {!loading && posts.length > 0 && (
        <div className="flex items-center gap-3 mb-6 flex-wrap animate-slide-up delay-100">
          {[
            { label: 'Total Posts', value: posts.length, icon: LayoutGrid },
            { label: 'Total Likes', value: Object.values(likeCounts).reduce((a, b) => a + b, 0), icon: Heart },
            { label: 'Total Views', value: Object.values(viewCounts).reduce((a, b) => a + b, 0), icon: Eye },
            { label: 'Unique Tags', value: allTags.length, icon: Flame },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl
              glass-card border border-white/40 dark:border-slate-700/40"
            >
              <div className="h-7 w-7 rounded-xl flex items-center justify-center"
                style={{ background: 'var(--gradient)' }}>
                <Icon className="h-3.5 w-3.5 text-white" />
              </div>
              <div>
                <p className="text-sm font-black text-slate-900 dark:text-white leading-none">{value}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Search + Filters ──────────────────────────── */}
      <div className="glass-card rounded-3xl p-4 mb-8 animate-slide-up delay-100 border border-white/40 dark:border-slate-700/40">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search posts by caption..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-2xl text-sm
                bg-white/70 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100
                placeholder-slate-400 focus:outline-none transition-all duration-200
                border border-slate-200/60 dark:border-slate-700/40"
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e)  => e.target.style.borderColor = ''}
            />
          </div>

          {/* Filters row */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* All / Fav toggle */}
            <div className="flex bg-slate-100/80 dark:bg-slate-800/80 p-0.5 rounded-2xl
              border border-slate-200/50 dark:border-slate-700/50">
              {['all', 'liked'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilterType(f)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold
                    transition-all duration-200 cursor-pointer capitalize
                    ${filterType === f ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white'}`}
                  style={filterType === f ? { color: 'var(--primary)' } : {}}
                >
                  {f === 'liked' && <Heart className={`h-3 w-3 ${f === filterType ? 'fill-current' : ''}`} />}
                  {f === 'liked' ? 'Favorites' : 'All'}
                </button>
              ))}
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2 bg-slate-100/80 dark:bg-slate-800/80 px-3 py-2 rounded-2xl
              border border-slate-200/50 dark:border-slate-700/50">
              <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-xs font-bold focus:outline-none cursor-pointer text-slate-600 dark:text-slate-300"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="most-liked">Most Liked</option>
                <option value="most-viewed">Most Viewed</option>
              </select>
            </div>

            {/* Count badge */}
            <div className="flex items-center gap-1.5 bg-slate-100/80 dark:bg-slate-800/80 px-3 py-2 rounded-2xl
              border border-slate-200/50 dark:border-slate-700/50 text-xs font-bold text-slate-500 dark:text-slate-400">
              <LayoutGrid className="h-3.5 w-3.5" />
              {processedPosts.length}
            </div>
          </div>
        </div>

        {/* Tag pills */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-3.5 pt-3.5 border-t border-slate-200/40 dark:border-slate-700/40">
            <span className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Filter:</span>
            <button
              onClick={() => setSelectedTag(null)}
              className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all duration-200
                ${!selectedTag ? 'text-white shadow-md glow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
              style={!selectedTag ? { background: 'var(--gradient)' } : {}}
            >All</button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all duration-200
                  ${selectedTag === tag ? 'text-white shadow-md glow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                style={selectedTag === tag ? { background: 'var(--gradient)' } : {}}
              >#{tag}</button>
            ))}
          </div>
        )}
      </div>

      {/* ── Posts Grid ────────────────────────────────── */}
      {loading ? (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5">
          {[280, 220, 340, 250, 300, 210].map((h, i) => (
            <div key={i} className="break-inside-avoid rounded-3xl overflow-hidden border border-slate-200/60 dark:border-slate-800/60">
              <div className="shimmer-bg" style={{ height: h }} />
              <div className="p-4 space-y-2 bg-white/40 dark:bg-slate-900/30">
                <div className="h-3 shimmer-bg rounded-full w-3/4" />
                <div className="h-2.5 shimmer-bg rounded-full w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : processedPosts.length > 0 ? (
        /* Masonry-style columns layout */
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-5">
          {processedPosts.map((post, index) => (
            <article
              key={post._id}
              className="break-inside-avoid mb-5 group relative rounded-3xl overflow-hidden
                glass-card border border-white/40 dark:border-slate-700/40
                card-hover animate-slide-up cursor-pointer"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Image */}
              <div
                className="relative overflow-hidden bg-slate-100 dark:bg-slate-950"
                onClick={() => handleImageClick(post._id)}
                onDoubleClick={(e) => handleDoubleTap(e, post._id)}
              >
                <img
                  className="w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  src={post.image}
                  alt={post.caption}
                  loading="lazy"
                  style={{ aspectRatio: index % 3 === 1 ? '4/5' : '4/3' }}
                />

                {/* Double-tap heart burst overlay */}
                {doubleTapPost?.id === post._id && (
                  <span
                    key={doubleTapPost.id + doubleTapPost.x}
                    className="absolute pointer-events-none text-5xl animate-heart-burst select-none z-20"
                    style={{ left: doubleTapPost.x, top: doubleTapPost.y }}
                  >
                    ❤️
                  </span>
                )}
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent
                  opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Action buttons (top right) */}
                <div
                  className="absolute top-3 right-3 flex items-center gap-1.5
                    opacity-0 group-hover:opacity-100 transition-all duration-300
                    translate-y-1 group-hover:translate-y-0"
                  onClick={e => e.stopPropagation()}
                >
                  {[
                    { icon: Download, action: () => handleDownload(post.image, post.caption), cls: '' },
                    { icon: Copy,     action: () => handleCopyCaption(post.caption),            cls: '' },
                    { icon: Trash2,   action: () => handleDelete(post._id),                     cls: 'text-red-400 hover:!bg-red-500' },
                  ].map(({ icon: Icon, action, cls }, i) => (
                    <button
                      key={i}
                      onClick={action}
                      className={`h-8 w-8 flex items-center justify-center rounded-xl
                        bg-black/40 dark:bg-black/60 backdrop-blur text-white/90
                        hover:text-white transition-all duration-200 hover:scale-110 shadow-md ${cls}`}
                      onMouseEnter={e => { if (!cls.includes('red')) e.currentTarget.style.background = 'var(--gradient)'; }}
                      onMouseLeave={e => { if (!cls.includes('red')) e.currentTarget.style.background = ''; }}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </button>
                  ))}
                </div>

                {/* Time badge */}
                {post.createdAt && (
                  <div className="absolute bottom-3 left-3 flex items-center gap-1
                    px-2 py-1 rounded-lg bg-black/40 backdrop-blur text-white text-[10px] font-medium
                    opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Clock className="h-3 w-3" />
                    {timeAgo(post.createdAt)}
                  </div>
                )}
              </div>

              {/* Card footer */}
              <div className="p-4">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed line-clamp-2 first-letter:uppercase mb-2.5">
                  {post.caption}
                </p>

                {/* Tags */}
                {post.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {post.tags.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        onClick={(e) => { e.stopPropagation(); setSelectedTag(selectedTag === tag ? null : tag.toLowerCase()); }}
                        className="tag-pill"
                      >
                        #{tag}
                      </span>
                    ))}
                    {post.tags.length > 3 && (
                      <span className="text-[10px] text-slate-400 font-semibold px-1 self-center">
                        +{post.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* Like + Share row */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100/60 dark:border-slate-800/60">
                  <button
                    onClick={() => toggleLike(post._id)}
                    className="flex items-center gap-1.5 text-sm font-semibold transition-all duration-200 group/like"
                  >
                    <Heart
                      className={`h-4 w-4 transition-all duration-300
                        ${likedPosts[post._id] ? 'scale-110 animate-heartbeat' : 'group-hover/like:scale-110'}`}
                      style={{
                        color: likedPosts[post._id] ? 'var(--primary)' : undefined,
                        fill:  likedPosts[post._id] ? 'var(--primary)' : 'none',
                      }}
                    />
                    <span style={{ color: likedPosts[post._id] ? 'var(--primary)' : undefined }}
                      className={likedPosts[post._id] ? 'font-bold' : 'text-slate-400 dark:text-slate-500'}>
                      {likeCounts[post._id] || 0}
                    </span>
                  </button>

                  {/* Comment count */}
                  <button
                    onClick={(e) => { e.stopPropagation(); openLightbox(post._id); }}
                    className="flex items-center gap-1.5 text-xs font-semibold text-slate-400
                      hover:text-slate-700 dark:hover:text-white transition-colors duration-200 group/comment"
                  >
                    <MessageCircle className="h-3.5 w-3.5 group-hover/comment:scale-110 transition-transform" />
                    <span>{(comments[post._id] || []).length}</span>
                  </button>

                  {/* View count */}
                  <span className="flex items-center gap-1 text-xs font-semibold text-slate-400">
                    <Eye className="h-3.5 w-3.5" />
                    <span>{viewCounts[post._id] || 0}</span>
                  </span>

                  <button
                    onClick={() => handleShare(post)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-slate-400
                      hover:text-slate-700 dark:hover:text-white transition-colors duration-200 group/share"
                  >
                    <Share2 className="h-3.5 w-3.5 group-hover/share:scale-110 transition-transform" />
                    <span className="hidden sm:inline">Share</span>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-24 text-center animate-scale-in">
          <div className="relative mb-6">
            <div className="h-20 w-20 rounded-3xl theme-gradient flex items-center justify-center shadow-2xl glow-primary">
              <ImageOff className="h-9 w-9 text-white" />
            </div>
            <div className="absolute inset-0 rounded-3xl theme-gradient opacity-30 blur-xl -z-10" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
            {searchTerm ? 'No results found' : selectedTag ? `No posts under #${selectedTag}` : 'Gallery is empty'}
          </h2>
          <p className="text-sm text-slate-400 dark:text-slate-500 max-w-sm">
            {searchTerm ? `No matches for "${searchTerm}".`
              : selectedTag ? `Nothing tagged #${selectedTag} yet.`
              : filterType === 'liked' ? "You haven't liked any posts yet."
              : "Be the first to share something beautiful."}
          </p>
          <button
            onClick={filterType === 'liked' ? () => setFilterType('all') : () => navigate('/')}
            className="mt-7 inline-flex items-center gap-2 px-6 py-3 text-white font-bold rounded-2xl
              shadow-lg glow-sm transition-all hover:scale-105 active:scale-95 text-sm"
            style={{ background: 'var(--gradient)' }}
          >
            <PlusCircle className="h-4 w-4" />
            {filterType === 'liked' ? 'View All Posts' : 'Create First Post'}
          </button>
        </div>
      )}

      {/* ── Lightbox ──────────────────────────────────── */}
      {lightboxPost && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8
            bg-black/85 backdrop-blur-md animate-fade-in"
          onClick={() => setActiveLightboxIndex(null)}
        >
          {/* Close */}
          <button
            onClick={() => setActiveLightboxIndex(null)}
            className="absolute top-4 right-4 z-10 h-10 w-10 rounded-2xl
              bg-white/10 hover:bg-white/20 text-white backdrop-blur
              border border-white/10 flex items-center justify-center transition-all hover:scale-110"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Nav arrows */}
          {[
            { dir: 'left',  action: e => { e.stopPropagation(); setActiveLightboxIndex(p => p > 0 ? p - 1 : processedPosts.length - 1); } },
            { dir: 'right', action: e => { e.stopPropagation(); setActiveLightboxIndex(p => p < processedPosts.length - 1 ? p + 1 : 0); } },
          ].map(({ dir, action }) => (
            <button
              key={dir}
              onClick={action}
              className={`absolute ${dir === 'left' ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 z-10
                h-11 w-11 rounded-2xl bg-white/10 hover:bg-white/20 text-white backdrop-blur
                border border-white/10 flex items-center justify-center transition-all hover:scale-110`}
            >
              {dir === 'left' ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
            </button>
          ))}

          {/* Modal */}
          <div
            className="relative max-w-5xl w-full max-h-[90vh] rounded-3xl overflow-hidden
              flex flex-col md:flex-row shadow-2xl border border-white/10 animate-scale-in"
            onClick={e => e.stopPropagation()}
          >
            {/* Image side */}
            <div className="flex-1 bg-slate-950 flex items-center justify-center min-h-[280px] md:min-h-0">
              <img
                src={lightboxPost.image}
                alt={lightboxPost.caption}
                className="max-w-full max-h-[50vh] md:max-h-[90vh] object-contain"
              />
            </div>

              <div className="w-full md:w-80 flex flex-col bg-white dark:bg-slate-900
                border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800">
                <div className="flex-1 p-5 overflow-y-auto">
                  <span className="text-[9px] font-black uppercase tracking-[0.18em]" style={{ color: 'var(--primary)' }}>
                    Post Details
                  </span>
                  {lightboxPost.createdAt && (
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1 font-medium">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {timeAgo(lightboxPost.createdAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {viewCounts[lightboxPost._id] || 0} views
                      </span>
                    </div>
                  )}
                  <p className="text-sm text-slate-800 dark:text-slate-200 font-medium leading-relaxed mt-3 first-letter:uppercase">
                    {lightboxPost.caption}
                  </p>
                  {lightboxPost.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-4">
                      {lightboxPost.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          onClick={() => { setSelectedTag(tag); setActiveLightboxIndex(null); }}
                          className="tag-pill"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* ── Comments Section ─────────────────── */}
                  <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-1.5 mb-3">
                      <MessageCircle className="h-3.5 w-3.5" style={{ color: 'var(--primary)' }} />
                      <span className="text-[10px] font-black uppercase tracking-[0.15em]" style={{ color: 'var(--primary)' }}>
                        Comments
                      </span>
                      <span className="ml-auto text-[10px] font-bold text-slate-400">
                        {(comments[lightboxPost._id] || []).length}
                      </span>
                    </div>

                    {/* Comment list */}
                    <div className="space-y-2.5 max-h-40 overflow-y-auto pr-1">
                      {(comments[lightboxPost._id] || []).length === 0 ? (
                        <p className="text-xs text-slate-400 italic text-center py-3">No comments yet. Be the first!</p>
                      ) : (
                        (comments[lightboxPost._id] || []).map((c) => (
                          <div key={c._id} className="group/c flex items-start gap-2 p-2.5 rounded-xl
                            bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/40">
                            <div className="h-6 w-6 rounded-full flex items-center justify-center shrink-0"
                              style={{ background: 'var(--gradient)' }}>
                              <User className="h-3 w-3 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[11px] font-black text-slate-700 dark:text-slate-200 leading-none truncate">
                                {c.author || 'Anonymous'}
                              </p>
                              <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed break-words">
                                {c.text}
                              </p>
                            </div>
                            <button
                              onClick={() => handleDeleteComment(lightboxPost._id, c._id)}
                              className="opacity-0 group-hover/c:opacity-100 transition-opacity
                                h-5 w-5 rounded-md flex items-center justify-center
                                text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 shrink-0"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Add comment */}
                    <div className="mt-3 space-y-2">
                      <input
                        type="text"
                        placeholder="Your name (optional)"
                        value={commentAuthor}
                        onChange={(e) => setCommentAuthor(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl text-xs
                          bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/40
                          text-slate-800 dark:text-slate-200 placeholder-slate-400
                          focus:outline-none focus:border-[var(--primary)] transition-colors"
                      />
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Write a comment..."
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') handleAddComment(lightboxPost._id); }}
                          className="flex-1 px-3 py-2 rounded-xl text-xs
                            bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/40
                            text-slate-800 dark:text-slate-200 placeholder-slate-400
                            focus:outline-none focus:border-[var(--primary)] transition-colors"
                        />
                        <button
                          onClick={() => handleAddComment(lightboxPost._id)}
                          disabled={commentLoading}
                          className="h-8 w-8 rounded-xl flex items-center justify-center text-white
                            shadow-md transition-all hover:scale-110 active:scale-95 shrink-0"
                          style={{ background: 'var(--gradient)' }}
                        >
                          <Send className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

              <div className="p-5 border-t border-slate-100 dark:border-slate-800 space-y-4">
                {/* Like */}
                <button
                  onClick={() => toggleLike(lightboxPost._id)}
                  className="flex items-center gap-2 text-sm font-bold transition-all"
                >
                  <Heart
                    className={`h-5 w-5 transition-all ${likedPosts[lightboxPost._id] ? 'scale-110' : ''}`}
                    style={{
                      color: likedPosts[lightboxPost._id] ? 'var(--primary)' : undefined,
                      fill:  likedPosts[lightboxPost._id] ? 'var(--primary)' : 'none',
                    }}
                  />
                  <span style={{ color: likedPosts[lightboxPost._id] ? 'var(--primary)' : undefined }}
                    className={likedPosts[lightboxPost._id] ? '' : 'text-slate-500 dark:text-slate-400'}>
                    {likeCounts[lightboxPost._id] || 0} Likes
                  </span>
                </button>

                {/* Actions grid */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { icon: Download, label: 'Save', action: () => handleDownload(lightboxPost.image, lightboxPost.caption) },
                    { icon: Copy,     label: 'Copy',  action: () => handleCopyCaption(lightboxPost.caption) },
                    { icon: Share2,   label: 'Share', action: () => handleShare(lightboxPost) },
                  ].map(({ icon: Icon, label, action }) => (
                    <button
                      key={label}
                      onClick={action}
                      className="flex flex-col items-center gap-1 py-2.5 rounded-2xl text-white text-[10px] font-bold
                        transition-all hover:scale-105 active:scale-95 shadow-md"
                      style={{ background: 'var(--gradient)' }}
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </button>
                  ))}
                  <button
                    onClick={() => handleDelete(lightboxPost._id)}
                    className="col-span-3 flex items-center justify-center gap-2 py-2.5 rounded-2xl
                      text-red-500 dark:text-red-400 text-xs font-bold
                      bg-red-50 dark:bg-red-900/20 hover:bg-red-500 dark:hover:bg-red-500
                      hover:text-white transition-all mt-1"
                  >
                    <Trash2 className="h-4 w-4" /> Delete Post
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Page indicator */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
            {processedPosts.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveLightboxIndex(i)}
                className={`rounded-full transition-all duration-200
                  ${i === activeLightboxIndex ? 'w-5 h-2' : 'w-2 h-2 bg-white/30 hover:bg-white/50'}`}
                style={i === activeLightboxIndex ? { background: 'var(--gradient)' } : {}}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Feed;
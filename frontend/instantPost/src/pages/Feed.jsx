import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import {
  Search, Heart, Share2, Download, Copy, LayoutGrid,
  AlertCircle, PlusCircle, X, ChevronLeft, ChevronRight,
  SlidersHorizontal, Sparkles, Trash2, Clock, ImageOff
} from 'lucide-react';

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [likedPosts, setLikedPosts] = useState({});
  const [likeCounts, setLikeCounts] = useState({});
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedTag, setSelectedTag] = useState(null);
  const [activeLightboxIndex, setActiveLightboxIndex] = useState(null);

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
      data.forEach(p => { counts[p._id] = p.likes || 0; });
      setLikeCounts(counts);
    } catch {
      showToast('Failed to load feed posts', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

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

  const openLightbox = (postId) => {
    const idx = processedPosts.findIndex(p => p._id === postId);
    if (idx !== -1) setActiveLightboxIndex(idx);
  };

  const lightboxPost = activeLightboxIndex !== null ? processedPosts[activeLightboxIndex] : null;

  return (
    <div className="min-h-screen px-5 sm:px-8 py-8 transition-colors duration-300">

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
                onClick={() => openLightbox(post._id)}
              >
                <img
                  className="w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  src={post.image}
                  alt={post.caption}
                  loading="lazy"
                  style={{ aspectRatio: index % 3 === 1 ? '4/5' : '4/3' }}
                />
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

            {/* Detail side */}
            <div className="w-full md:w-80 flex flex-col bg-white dark:bg-slate-900
              border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800">
              <div className="flex-1 p-5 overflow-y-auto">
                <span className="text-[9px] font-black uppercase tracking-[0.18em]" style={{ color: 'var(--primary)' }}>
                  Post Details
                </span>
                {lightboxPost.createdAt && (
                  <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1 font-medium">
                    <Clock className="h-3 w-3" /> {timeAgo(lightboxPost.createdAt)}
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
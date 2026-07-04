import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import {
  UploadCloud, X, Send, Sparkles, Clock,
  AlertCircle, Wand2, Image as ImageIcon, Tag, Type, Layers
} from 'lucide-react';

const MAGIC_CAPTIONS = [
  // Aesthetic / Life
  "Chasing sunsets and good vibes only ✨",
  "Living in the moments between the moments 🌙",
  "Some days you just need a little magic ✨",
  "Not all who wander are lost, but I might be 🗺️",
  "Collecting memories, not things 💫",
  "Bloom where you are planted 🌸",
  "The vibe is immaculate and the energy is unmatched 🔥",
  "Just a soul with too many dreams and too little time ⏳",
  "Somewhere between reality and a daydream 🌊",
  "Golden hour hits different when you're happy 🌅",
  // Nature
  "Nature always wears the colors of the spirit 🍃",
  "Mountains are calling and I must go 🏔️",
  "In every walk with nature, one receives far more than he seeks 🌿",
  "The sky is not the limit, it's just the beginning 🌤️",
  "Wild at heart, free in soul 🌊",
  // Travel
  "New place, same me — just slightly more caffeinated ☕",
  "Wanderlust and city dust 🏙️",
  "Every destination is a new chapter 📖",
  "Adventures are the best way to learn 🌍",
  "Far from home, close to my heart 💛",
  // Food / Cozy
  "Good food, good mood, zero regrets 🍜",
  "Treat yourself — you deserve it 🧁",
  "The secret ingredient is always love (and a little butter) 🧈",
  "Cozy vibes and warm drinks make everything better ☕",
  // Motivation
  "Progress, not perfection 🚀",
  "Small steps every day lead to big changes 💪",
  "Be the energy you want to attract ⚡",
  "Do more of what makes you feel alive 🌺",
  "Your vibe is your brand — make it iconic 💎",
  // Fun / Playful
  "Not a regular post, a cool post 😎",
  "Main character energy activated 🎬",
  "If you're reading this, go drink some water 💧",
  "Living rent-free in my own highlight reel 🎞️",
];

const CreatePost = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { currentTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState('');
  const [tags, setTags] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [limitStatus, setLimitStatus] = useState(null);
  const [isMagicLoading, setIsMagicLoading] = useState(false);

  const generateMagicCaption = () => {
    if (isMagicLoading || isLimitReached) return;
    setIsMagicLoading(true);
    setTimeout(() => {
      setCaption(MAGIC_CAPTIONS[Math.floor(Math.random() * MAGIC_CAPTIONS.length)]);
      setIsMagicLoading(false);
    }, 500);
  };

  const fetchLimitStatus = async () => {
    try {
      const res = await axios.get("https://instapost-nb20.onrender.com/posts/limit-status");
      setLimitStatus(res.data);
    } catch (error) {
      console.error("Failed to fetch limit status:", error);
    }
  };

  useEffect(() => { fetchLimitStatus(); }, []);

  const getRemainingTimeStr = (availableAtStr) => {
    if (!availableAtStr) return '';
    const diffMs = new Date(availableAtStr) - new Date();
    if (diffMs <= 0) return 'Available now';
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return diffHrs > 0 ? `${diffHrs}h ${diffMins}m` : `${diffMins}m`;
  };

  const handleFile = (file) => {
    if (!file.type.startsWith('image/')) { showToast('Please select a valid image file', 'error'); return; }
    if (file.size > 5 * 1024 * 1024) { showToast('Image size must be less than 5MB', 'error'); return; }
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleImageChange = (e) => { const f = e.target.files[0]; if (f) handleFile(f); };
  const handleDragOver  = (e) => { e.preventDefault(); setIsDragOver(true); };
  const handleDragLeave = ()  => setIsDragOver(false);
  const handleDrop      = (e) => { e.preventDefault(); setIsDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); };
  const removeSelectedImage = () => { setPreview(null); setImageFile(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (limitStatus) {
      if (limitStatus.totalCount >= limitStatus.totalLimit) { showToast('Total photo limit reached.', 'error'); return; }
      if (limitStatus.dailyCount >= limitStatus.dailyLimit) { showToast('Daily upload limit reached.', 'error'); return; }
    }
    if (!imageFile) { showToast('Please select or drag an image', 'error'); return; }
    if (!caption.trim()) { showToast('Please write an interesting caption', 'error'); return; }

    setLoading(true);
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('caption', caption.trim());
    formData.append('tags', tags.trim());

    try {
      await axios.post("https://instapost-nb20.onrender.com/create-post", formData);
      showToast('Post shared with the world!', 'success');
      setTimeout(() => navigate("/feed"), 1000);
    } catch (error) {
      console.error(error);
      showToast(error.response?.data?.message || 'Failed to create post.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const isLimitReached = limitStatus
    ? (limitStatus.totalCount >= limitStatus.totalLimit || limitStatus.dailyCount >= limitStatus.dailyLimit)
    : false;

  /* ─── Tag chips preview ─────────────────────────────── */
  const tagList = tags.split(',').map(t => t.trim()).filter(Boolean);

  return (
    <div className="relative min-h-screen flex flex-col lg:flex-row overflow-hidden">

      {/* ── Left panel: decorative / image drop zone ──── */}
      <div className="relative lg:w-[48%] min-h-[300px] lg:min-h-screen flex flex-col items-center justify-center
        bg-gradient-to-br from-slate-100 to-slate-200 dark:from-[#0a1020] dark:to-[#0f1a35] overflow-hidden">

        {/* Animated blobs */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full opacity-30 blur-3xl pointer-events-none animate-blob"
          style={{ background: 'var(--gradient)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full opacity-20 blur-3xl pointer-events-none animate-blob delay-300"
          style={{ background: 'var(--gradient)', animationDelay: '3s' }} />
        <div className="absolute top-3/4 left-1/2 w-48 h-48 rounded-full opacity-15 blur-3xl pointer-events-none animate-blob"
          style={{ background: 'var(--gradient)', animationDelay: '6s' }} />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
          style={{
            backgroundImage: 'linear-gradient(var(--primary) 1px, transparent 1px), linear-gradient(90deg, var(--primary) 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }} />

        {/* Image drop / preview area */}
        <div className="relative z-10 w-full max-w-sm px-6">
          {!preview ? (
            <div
              onDragOver={isLimitReached ? undefined : handleDragOver}
              onDragLeave={isLimitReached ? undefined : handleDragLeave}
              onDrop={isLimitReached ? undefined : handleDrop}
              className={`relative flex flex-col items-center justify-center
                h-72 lg:h-[420px] rounded-3xl border-2 border-dashed
                transition-all duration-500 cursor-pointer overflow-hidden
                ${isLimitReached
                  ? 'border-slate-300 dark:border-slate-700 bg-slate-100/50 dark:bg-slate-900/20 cursor-not-allowed'
                  : isDragOver
                    ? 'border-transparent scale-[0.98]'
                    : 'border-slate-300/70 dark:border-slate-700/60 hover:border-transparent'
                }`}
              style={
                isDragOver && !isLimitReached
                  ? { borderColor: 'var(--primary)', background: 'color-mix(in srgb, var(--primary) 8%, transparent)' }
                  : {}
              }
            >
              {/* Background glow on hover */}
              {!isLimitReached && !isDragOver && (
                <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-3xl"
                  style={{ background: 'color-mix(in srgb, var(--primary) 5%, transparent)' }} />
              )}

              <input
                type="file" name="image" accept="image/*"
                onChange={handleImageChange}
                disabled={isLimitReached}
                className={`absolute inset-0 w-full h-full opacity-0 z-10 ${isLimitReached ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              />

              <div className="relative z-0 flex flex-col items-center text-center p-6">
                <div className={`h-20 w-20 rounded-3xl flex items-center justify-center mb-5 transition-all duration-300
                  ${isDragOver && !isLimitReached ? 'scale-110 shadow-2xl glow-primary' : ''}`}
                  style={{ background: isLimitReached ? 'rgba(148,163,184,0.1)' : 'var(--gradient)' }}>
                  {isDragOver
                    ? <Layers className="h-9 w-9 text-white" />
                    : <UploadCloud className="h-9 w-9" style={{ color: isLimitReached ? '#94a3b8' : 'white' }} />
                  }
                </div>
                <p className="text-base font-bold text-slate-700 dark:text-slate-200">
                  {isLimitReached ? 'Upload Disabled' : isDragOver ? 'Release to upload!' : 'Drop your photo here'}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">
                  {isLimitReached ? 'Upload limits exceeded' : 'or click to browse — JPG, PNG, GIF up to 5MB'}
                </p>
                {!isLimitReached && !isDragOver && (
                  <div className="mt-6 px-5 py-2 rounded-full text-xs font-bold text-white shadow-lg glow-sm
                    transition-all duration-300 hover:scale-105"
                    style={{ background: 'var(--gradient)' }}>
                    Browse files
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="relative rounded-3xl overflow-hidden shadow-2xl group border border-white/20 dark:border-slate-700/40">
              <img src={preview} alt="Preview" className="w-full h-72 lg:h-[420px] object-cover" />
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent
                opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end p-5">
                <button
                  type="button"
                  onClick={removeSelectedImage}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600
                    text-white rounded-xl font-semibold text-sm transition-all shadow-lg
                    translate-y-2 group-hover:translate-y-0"
                >
                  <X className="h-4 w-4" /> Remove Photo
                </button>
              </div>
              {/* Corner badge */}
              <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur
                text-white text-[10px] font-bold border border-white/10">
                <ImageIcon className="inline h-3 w-3 mr-1" />
                Ready
              </div>
            </div>
          )}

          {/* Caption preview badge */}
          {preview && caption && (
            <div className="mt-4 p-3 rounded-2xl glass-light border border-white/30 dark:border-slate-700/40 animate-slide-up">
              <p className="text-xs text-slate-600 dark:text-slate-300 italic leading-relaxed line-clamp-2">
                "{caption}"
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Right panel: form ─────────────────────────── */}
      <div className="flex-1 flex flex-col lg:overflow-y-auto">
        <div className="flex-1 flex flex-col justify-center px-6 sm:px-10 py-10 max-w-lg mx-auto w-full">

          {/* Header */}
          <div className="mb-8 animate-slide-up">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-11 w-11 rounded-2xl theme-gradient flex items-center justify-center shadow-lg glow-sm">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-none">
                  Create Post
                </h1>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Share a moment with the community</p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-5">
              <div className="relative h-16 w-16">
                <div className="absolute inset-0 rounded-full opacity-20"
                  style={{ border: '3px solid var(--primary)' }} />
                <div className="absolute inset-0 rounded-full border-[3px] border-transparent animate-spin"
                  style={{ borderTopColor: 'var(--primary)' }} />
                <div className="absolute inset-[6px] rounded-full theme-gradient opacity-30 animate-pulse" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Uploading your post...</p>
                <p className="text-xs text-slate-400 mt-1">This may take a moment</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Quota overview */}
              {limitStatus && (
                <div className="p-4 rounded-2xl glass-light border border-white/30 dark:border-slate-700/40
                  animate-slide-up space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">
                      Upload Quota
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                      {Math.max(0, limitStatus.totalLimit - limitStatus.totalCount)} slots left
                    </span>
                  </div>

                  {/* Daily bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px]">
                      <span className="font-semibold text-slate-600 dark:text-slate-300">Daily (24h window)</span>
                      <span className={`font-bold ${limitStatus.dailyCount >= limitStatus.dailyLimit ? 'text-amber-500' : 'text-slate-600 dark:text-slate-300'}`}>
                        {limitStatus.dailyCount} / {limitStatus.dailyLimit}
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${Math.min((limitStatus.dailyCount / limitStatus.dailyLimit) * 100, 100)}%`,
                          background: limitStatus.dailyCount >= limitStatus.dailyLimit
                            ? 'linear-gradient(to right, #f59e0b, #ef4444)' : 'var(--gradient)'
                        }} />
                    </div>
                  </div>

                  {/* Total bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px]">
                      <span className="font-semibold text-slate-600 dark:text-slate-300">Total Photos</span>
                      <span className={`font-bold ${limitStatus.totalCount >= limitStatus.totalLimit ? 'text-red-500' : 'text-slate-600 dark:text-slate-300'}`}>
                        {limitStatus.totalCount} / {limitStatus.totalLimit}
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${Math.min((limitStatus.totalCount / limitStatus.totalLimit) * 100, 100)}%`,
                          background: limitStatus.totalCount >= limitStatus.totalLimit ? '#ef4444' : 'var(--gradient)'
                        }} />
                    </div>
                  </div>

                  {/* Alerts */}
                  {limitStatus.totalCount >= limitStatus.totalLimit && (
                    <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 animate-fade-in">
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold">Storage Full</p>
                        <p className="text-[11px] opacity-80 mt-0.5">
                          <button type="button" onClick={() => navigate('/feed')} className="underline font-bold">Delete some photos</button> to make space.
                        </p>
                      </div>
                    </div>
                  )}
                  {limitStatus.totalCount < limitStatus.totalLimit && limitStatus.dailyCount >= limitStatus.dailyLimit && (
                    <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 animate-fade-in">
                      <Clock className="h-4 w-4 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold">Daily Limit Reached</p>
                        <p className="text-[11px] opacity-80 mt-0.5">
                          Next slot in <span className="font-bold">{getRemainingTimeStr(limitStatus.nextUploadAvailableAt)}</span>
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Caption */}
              <div className="animate-slide-up delay-100">
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">
                    <Type className="h-3 w-3" /> Caption
                  </label>
                  <button
                    type="button"
                    onClick={generateMagicCaption}
                    disabled={isLimitReached || isMagicLoading}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold
                      transition-all duration-200 select-none
                      ${isLimitReached
                        ? 'text-slate-400 cursor-not-allowed opacity-50 bg-slate-100 dark:bg-slate-800'
                        : 'text-white cursor-pointer hover:scale-105 active:scale-95 shadow-md glow-sm'
                      }`}
                    style={{ background: isLimitReached ? 'none' : 'var(--gradient)' }}
                  >
                    <Wand2 className={`h-3 w-3 ${isMagicLoading ? 'animate-spin' : ''}`} />
                    {isMagicLoading ? 'Conjuring...' : '✨ Magic Caption'}
                  </button>
                </div>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder={isLimitReached ? "Upload limits exceeded." : "Write something captivating..."}
                  rows={3}
                  disabled={isLimitReached}
                  className={`w-full px-4 py-3 rounded-2xl text-sm transition-all duration-200 resize-none
                    border focus:outline-none
                    text-slate-900 dark:text-slate-50 placeholder-slate-400
                    ${isLimitReached
                      ? 'bg-slate-100/50 dark:bg-slate-900/20 border-slate-200 dark:border-slate-800 cursor-not-allowed text-slate-400'
                      : 'bg-white/70 dark:bg-slate-800/50 border-slate-200/70 dark:border-slate-700/50 focus:border-transparent focus:ring-2'
                    }`}
                  style={!isLimitReached ? { '--tw-ring-color': 'var(--primary)' } : {}}
                  onFocus={(e) => { if (!isLimitReached) e.target.style.borderColor = 'var(--primary)'; }}
                  onBlur={(e) => { e.target.style.borderColor = ''; }}
                />
                <div className="flex justify-end mt-1">
                  <span className="text-[10px] text-slate-400">{caption.length} chars</span>
                </div>
              </div>

              {/* Tags */}
              <div className="animate-slide-up delay-200">
                <label className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500 mb-2">
                  <Tag className="h-3 w-3" /> Tags
                  <span className="font-normal normal-case text-slate-400">(comma-separated)</span>
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="nature, summer, vibes"
                  disabled={isLimitReached}
                  className={`w-full px-4 py-3 rounded-2xl text-sm transition-all duration-200
                    border focus:outline-none
                    text-slate-900 dark:text-slate-50 placeholder-slate-400
                    ${isLimitReached
                      ? 'bg-slate-100/50 dark:bg-slate-900/20 border-slate-200 dark:border-slate-800 cursor-not-allowed text-slate-400'
                      : 'bg-white/70 dark:bg-slate-800/50 border-slate-200/70 dark:border-slate-700/50 focus:border-transparent focus:ring-2'
                    }`}
                  style={!isLimitReached ? { '--tw-ring-color': 'var(--primary)' } : {}}
                  onFocus={(e) => { if (!isLimitReached) e.target.style.borderColor = 'var(--primary)'; }}
                  onBlur={(e) => { e.target.style.borderColor = ''; }}
                />
                {/* Live tag chips */}
                {tagList.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {tagList.map((t, i) => (
                      <span key={i} className="tag-pill">#{t}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit */}
              <div className="animate-slide-up delay-300 pt-1">
                <button
                  type="submit"
                  disabled={isLimitReached}
                  className={`w-full py-3.5 px-6 text-white font-bold rounded-2xl text-sm
                    transition-all duration-300 flex items-center justify-center gap-2.5 group
                    ${isLimitReached
                      ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                      : 'shadow-lg glow-sm hover:scale-[1.02] active:scale-[0.98]'
                    }`}
                  style={!isLimitReached ? { background: 'var(--gradient)' } : {}}
                >
                  {!isLimitReached && (
                    <span className="absolute inset-0 rounded-2xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                  <Send className={`h-4 w-4 transition-transform ${!isLimitReached ? 'group-hover:translate-x-1 group-hover:-translate-y-0.5' : ''}`} />
                  Publish Post
                </button>
              </div>

            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import ImageEditorModal from '../components/ImageEditorModal';
import {
  UploadCloud, X, Send, Sparkles, Clock,
  AlertCircle, Wand2, Image as ImageIcon, Tag, Type,
  Layers, SlidersHorizontal, Camera, Star, Zap, Heart
} from 'lucide-react';

const MAGIC_CAPTIONS = [
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
  "Nature always wears the colors of the spirit 🍃",
  "Mountains are calling and I must go 🏔️",
  "Wild at heart, free in soul 🌊",
  "New place, same me — just slightly more caffeinated ☕",
  "Wanderlust and city dust 🏙️",
  "Good food, good mood, zero regrets 🍜",
  "Progress, not perfection 🚀",
  "Be the energy you want to attract ⚡",
  "Main character energy activated 🎬",
  "Living rent-free in my own highlight reel 🎞️",
];

/* ─── Floating Particle Component ───────────────────── */
const FloatingParticle = ({ style, icon: Icon, delay = 0 }) => (
  <div
    className="absolute pointer-events-none select-none"
    style={{
      animation: `floatParticle ${6 + delay}s ease-in-out infinite`,
      animationDelay: `${delay}s`,
      ...style,
    }}
  >
    {Icon ? (
      <div
        className="rounded-2xl p-2 backdrop-blur-sm border border-white/20 shadow-lg"
        style={{ background: 'color-mix(in srgb, var(--primary) 20%, rgba(255,255,255,0.08))' }}
      >
        <Icon className="h-4 w-4 text-white/70" />
      </div>
    ) : null}
  </div>
);

/* ─── Stat Badge Component ───────────────────────────── */
const StatBadge = ({ label, value, icon: Icon, delay = 0, style }) => (
  <div
    className="absolute pointer-events-none select-none animate-slide-up"
    style={{ animationDelay: `${delay}ms`, ...style }}
  >
    <div className="flex items-center gap-2 px-3 py-2 rounded-2xl border border-white/15 shadow-xl backdrop-blur-xl"
      style={{ background: 'rgba(15, 20, 40, 0.7)' }}>
      <div className="h-6 w-6 rounded-lg flex items-center justify-center"
        style={{ background: 'var(--gradient)' }}>
        <Icon className="h-3 w-3 text-white" />
      </div>
      <div className="leading-none">
        <p className="text-[11px] font-black text-white">{value}</p>
        <p className="text-[9px] text-white/50 mt-0.5">{label}</p>
      </div>
    </div>
  </div>
);

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
  const [showEditor, setShowEditor] = useState(false);
  const [rawImageSrc, setRawImageSrc] = useState(null);
  const [activeStep, setActiveStep] = useState(1); // 1=upload, 2=details
  const uploadRef = useRef(null);

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
    const reader = new FileReader();
    reader.onloadend = () => {
      setRawImageSrc(reader.result);
      setImageFile(file);
      setPreview(reader.result);
      setShowEditor(true);
    };
    reader.readAsDataURL(file);
  };

  const handleEditorApply = (editedFile, editedPreviewUrl) => {
    setImageFile(editedFile);
    setPreview(editedPreviewUrl);
    setShowEditor(false);
    setActiveStep(2);
    showToast('Photo edited successfully!', 'success');
  };

  const removeSelectedImage = () => {
    setPreview(null);
    setImageFile(null);
    setRawImageSrc(null);
    setActiveStep(1);
  };

  const handleImageChange = (e) => { const f = e.target.files[0]; if (f) handleFile(f); };
  const handleDragOver  = (e) => { e.preventDefault(); setIsDragOver(true); };
  const handleDragLeave = ()  => setIsDragOver(false);
  const handleDrop      = (e) => { e.preventDefault(); setIsDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); };

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

  const tagList = tags.split(',').map(t => t.trim()).filter(Boolean);

  return (
    <>
      {/* ── Keyframe injection ─────────────────────── */}
      <style>{`
        @keyframes floatParticle {
          0%, 100% { transform: translateY(0px) rotate(0deg) scale(1); }
          33% { transform: translateY(-18px) rotate(4deg) scale(1.05); }
          66% { transform: translateY(-8px) rotate(-3deg) scale(0.97); }
        }
        @keyframes meshDrift {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(40px, -30px) scale(1.08); }
          66% { transform: translate(-20px, 20px) scale(0.94); }
        }
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes pulseRing {
          0% { transform: scale(0.9); opacity: 0.7; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes stepFill {
          from { width: 0%; }
          to { width: 100%; }
        }
        @keyframes revealUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .reveal-up { animation: revealUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .reveal-up-1 { animation-delay: 0ms; }
        .reveal-up-2 { animation-delay: 100ms; }
        .reveal-up-3 { animation-delay: 200ms; }
        .reveal-up-4 { animation-delay: 300ms; }
        .reveal-up-5 { animation-delay: 400ms; }
        .input-premium {
          width: 100%;
          padding: 14px 18px;
          border-radius: 16px;
          font-size: 14px;
          transition: all 0.25s ease;
          resize: none;
          border: 1.5px solid rgba(148, 163, 184, 0.2);
          background: rgba(255,255,255,0.06);
          color: inherit;
          outline: none;
        }
        .input-premium::placeholder { color: rgba(148, 163, 184, 0.5); }
        .input-premium:focus {
          border-color: var(--primary);
          background: rgba(255,255,255,0.09);
          box-shadow: 0 0 0 4px color-mix(in srgb, var(--primary) 15%, transparent);
        }
        .dark .input-premium { background: rgba(15,23,42,0.5); }
        .dark .input-premium:focus { background: rgba(15,23,42,0.7); }
        .light .input-premium { background: rgba(255,255,255,0.7); }
      `}</style>

      <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden
        bg-slate-50 dark:bg-[#080d1a] px-4 py-8">

        {/* ── Animated Mesh Background ─────────────────── */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Primary orb */}
          <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full opacity-20 dark:opacity-15"
            style={{
              background: 'var(--gradient)',
              filter: 'blur(100px)',
              animation: 'meshDrift 12s ease-in-out infinite',
            }} />
          {/* Secondary orb */}
          <div className="absolute bottom-[-15%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-15 dark:opacity-10"
            style={{
              background: 'var(--gradient)',
              filter: 'blur(120px)',
              animation: 'meshDrift 15s ease-in-out infinite reverse',
              animationDelay: '3s',
            }} />
          {/* Accent orb */}
          <div className="absolute top-[50%] left-[50%] w-[300px] h-[300px] rounded-full opacity-10 dark:opacity-08 -translate-x-1/2 -translate-y-1/2"
            style={{
              background: 'var(--gradient)',
              filter: 'blur(80px)',
              animation: 'meshDrift 9s ease-in-out infinite',
              animationDelay: '6s',
            }} />
          {/* Dot grid */}
          <div className="absolute inset-0 opacity-[0.025] dark:opacity-[0.04]"
            style={{
              backgroundImage: 'radial-gradient(circle, var(--primary) 1px, transparent 1px)',
              backgroundSize: '36px 36px',
            }} />
        </div>

        {/* ── Floating Decorative Particles ────────────── */}
        <FloatingParticle icon={Camera} style={{ top: '15%', left: '8%' }} delay={0} />
        <FloatingParticle icon={Star}   style={{ top: '25%', right: '9%' }} delay={2} />
        <FloatingParticle icon={Heart}  style={{ bottom: '30%', left: '7%' }} delay={4} />
        <FloatingParticle icon={Zap}    style={{ bottom: '20%', right: '8%' }} delay={1.5} />

        {/* ── Floating Stat Badges (hidden on mobile) ── */}
        <StatBadge
          icon={Heart} label="Total Likes" value="12.4K"
          delay={200} style={{ top: '22%', left: '3%', display: 'none' }}
        />

        {/* ── Main Container ───────────────────────────── */}
        <div className="relative z-10 w-full max-w-5xl mx-auto">

          {/* ── Hero Header ─────────────────────────────── */}
          <div className="text-center mb-8 reveal-up reveal-up-1">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4
              border border-white/20 dark:border-white/10 backdrop-blur-sm
              text-xs font-bold uppercase tracking-widest"
              style={{ background: 'color-mix(in srgb, var(--primary) 12%, rgba(255,255,255,0.06))' }}>
              <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: 'var(--primary)' }} />
              <span className="gradient-text">Share Your Moment</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05]
              text-slate-900 dark:text-white mb-3">
              Create a{' '}
              <span className="gradient-text">stunning</span>
              <br className="hidden sm:block" /> post
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-base max-w-md mx-auto leading-relaxed">
              Upload your photo, add a magnetic caption and watch the world react.
            </p>
          </div>

          {/* ── Step Indicator ───────────────────────────── */}
          <div className="flex items-center justify-center gap-3 mb-8 reveal-up reveal-up-2">
            {[
              { n: 1, label: 'Upload Photo' },
              { n: 2, label: 'Add Details' },
              { n: 3, label: 'Publish' },
            ].map(({ n, label }, i, arr) => (
              <React.Fragment key={n}>
                <div className="flex items-center gap-2">
                  <div className={`h-7 w-7 rounded-full flex items-center justify-center text-[11px] font-black
                    transition-all duration-500 ${
                      (preview && n === 1) || (activeStep >= n && n !== 1)
                        ? 'text-white shadow-lg glow-sm'
                        : 'text-slate-400 dark:text-slate-600 border border-slate-200 dark:border-slate-700'
                    }`}
                    style={(preview && n === 1) || (activeStep >= n && n !== 1)
                      ? { background: 'var(--gradient)' } : {}}>
                    {n}
                  </div>
                  <span className={`text-[11px] font-semibold hidden sm:block transition-colors duration-300 ${
                    (preview && n === 1) || (activeStep >= n && n !== 1)
                      ? 'text-slate-700 dark:text-slate-200'
                      : 'text-slate-400 dark:text-slate-600'
                  }`}>{label}</span>
                </div>
                {i < arr.length - 1 && (
                  <div className="flex-1 max-w-[60px] h-px bg-slate-200 dark:bg-slate-800 relative overflow-hidden rounded-full">
                    <div className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
                      style={{
                        background: 'var(--gradient)',
                        width: activeStep > n ? '100%' : preview && n === 1 ? '100%' : '0%',
                      }} />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* ── Limit Status Alert ───────────────────────── */}
          {limitStatus && isLimitReached && (
            <div className="mb-6 reveal-up reveal-up-2">
              <div className={`flex items-start gap-3 p-4 rounded-2xl backdrop-blur-sm border ${
                limitStatus.totalCount >= limitStatus.totalLimit
                  ? 'bg-red-500/8 border-red-500/25 text-red-600 dark:text-red-400'
                  : 'bg-amber-500/8 border-amber-500/25 text-amber-600 dark:text-amber-400'
              }`}>
                {limitStatus.totalCount >= limitStatus.totalLimit
                  ? <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                  : <Clock className="h-5 w-5 shrink-0 mt-0.5" />
                }
                <div>
                  <p className="font-bold text-sm">
                    {limitStatus.totalCount >= limitStatus.totalLimit ? 'Storage Full' : 'Daily Limit Reached'}
                  </p>
                  <p className="text-xs opacity-80 mt-0.5">
                    {limitStatus.totalCount >= limitStatus.totalLimit
                      ? <><button type="button" onClick={() => navigate('/feed')} className="underline font-bold">Delete some photos</button> to free up space.</>
                      : <>Next slot available in <strong>{getRemainingTimeStr(limitStatus.nextUploadAvailableAt)}</strong></>
                    }
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── Main Card Grid ───────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 reveal-up reveal-up-3">

            {/* ── LEFT: Upload Card ────────────────────── */}
            <div className="relative rounded-3xl overflow-hidden border border-white/20 dark:border-slate-700/40
              backdrop-blur-sm shadow-2xl"
              style={{ background: 'rgba(255,255,255,0.55)' }}
              ref={uploadRef}>
              <div className="dark:hidden absolute inset-0 rounded-3xl"
                style={{ background: 'rgba(255,255,255,0.55)' }} />
              <div className="hidden dark:block absolute inset-0 rounded-3xl"
                style={{ background: 'rgba(9,15,40,0.6)' }} />

              <div className="relative z-10 p-5">
                {/* Card header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-xl flex items-center justify-center"
                      style={{ background: 'var(--gradient)' }}>
                      <ImageIcon className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-800 dark:text-white leading-none">Your Photo</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">JPG, PNG, GIF up to 5MB</p>
                    </div>
                  </div>
                  {preview && (
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => setShowEditor(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-white text-[11px] font-bold
                          shadow-md transition-all hover:scale-105 active:scale-95"
                        style={{ background: 'var(--gradient)' }}
                      >
                        <SlidersHorizontal className="h-3 w-3" /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={removeSelectedImage}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-white text-[11px] font-bold
                          bg-red-500 hover:bg-red-600 shadow-md transition-all hover:scale-105 active:scale-95"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Upload / Preview Area */}
                {!preview ? (
                  <div
                    onDragOver={isLimitReached ? undefined : handleDragOver}
                    onDragLeave={isLimitReached ? undefined : handleDragLeave}
                    onDrop={isLimitReached ? undefined : handleDrop}
                    className={`relative flex flex-col items-center justify-center rounded-2xl
                      transition-all duration-500 overflow-hidden
                      ${isLimitReached ? 'cursor-not-allowed opacity-60' : 'cursor-pointer group'}
                      ${isDragOver && !isLimitReached ? 'scale-[0.98]' : ''}
                    `}
                    style={{
                      height: 320,
                      border: `2px dashed ${isDragOver && !isLimitReached ? 'var(--primary)' : 'rgba(148,163,184,0.3)'}`,
                      background: isDragOver && !isLimitReached
                        ? 'color-mix(in srgb, var(--primary) 6%, transparent)'
                        : 'transparent',
                    }}
                  >
                    <input
                      type="file" name="image" accept="image/*"
                      onChange={handleImageChange}
                      disabled={isLimitReached}
                      className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
                      style={{ cursor: isLimitReached ? 'not-allowed' : 'pointer' }}
                    />

                    {/* Pulse rings */}
                    {!isLimitReached && !isDragOver && (
                      <>
                        <div className="absolute h-32 w-32 rounded-full border border-slate-200/50 dark:border-slate-700/40
                          group-hover:scale-110 transition-all duration-500" />
                        <div className="absolute h-48 w-48 rounded-full border border-slate-200/30 dark:border-slate-700/20
                          group-hover:scale-110 transition-all duration-700" />
                      </>
                    )}

                    <div className="relative z-0 flex flex-col items-center text-center p-6">
                      {/* Upload icon */}
                      <div className={`h-20 w-20 rounded-3xl flex items-center justify-center mb-5
                        transition-all duration-500 shadow-xl
                        ${isDragOver && !isLimitReached ? 'scale-110 glow-primary' : 'group-hover:scale-105'}`}
                        style={{ background: isLimitReached ? 'rgba(148,163,184,0.1)' : 'var(--gradient)' }}>
                        {isDragOver
                          ? <Layers className="h-9 w-9 text-white" />
                          : <UploadCloud className="h-9 w-9" style={{ color: isLimitReached ? '#94a3b8' : 'white' }} />
                        }
                      </div>

                      <p className="text-base font-black text-slate-700 dark:text-slate-100">
                        {isLimitReached ? 'Upload Disabled' : isDragOver ? '🎯 Release to Upload!' : 'Drop your photo here'}
                      </p>
                      <p className="text-xs text-slate-400 mt-1.5">
                        {isLimitReached ? 'Upload limits exceeded' : 'or click anywhere to browse your files'}
                      </p>

                      {!isLimitReached && !isDragOver && (
                        <div className="mt-6 px-6 py-2.5 rounded-full text-xs font-bold text-white
                          shadow-lg glow-sm transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl"
                          style={{ background: 'var(--gradient)' }}>
                          Browse Files
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="relative rounded-2xl overflow-hidden" style={{ height: 320 }}>
                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                    {/* Badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full
                      bg-black/50 backdrop-blur-sm border border-white/15 text-white text-[10px] font-bold">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Ready to post
                    </div>
                  </div>
                )}

                {/* Quota mini bar */}
                {limitStatus && !isLimitReached && (
                  <div className="mt-4 p-3 rounded-xl border border-white/20 dark:border-slate-700/30"
                    style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Upload Quota</span>
                      <span className="text-[10px] font-semibold text-slate-500">
                        {Math.max(0, limitStatus.totalLimit - limitStatus.totalCount)} slots left
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      {/* Daily */}
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500 w-12 shrink-0">Daily</span>
                        <div className="flex-1 h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${Math.min((limitStatus.dailyCount / limitStatus.dailyLimit) * 100, 100)}%`,
                              background: limitStatus.dailyCount >= limitStatus.dailyLimit
                                ? 'linear-gradient(to right, #f59e0b, #ef4444)' : 'var(--gradient)'
                            }} />
                        </div>
                        <span className={`text-[10px] font-bold w-10 text-right ${
                          limitStatus.dailyCount >= limitStatus.dailyLimit ? 'text-amber-500' : 'text-slate-400'
                        }`}>{limitStatus.dailyCount}/{limitStatus.dailyLimit}</span>
                      </div>
                      {/* Total */}
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500 w-12 shrink-0">Total</span>
                        <div className="flex-1 h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${Math.min((limitStatus.totalCount / limitStatus.totalLimit) * 100, 100)}%`,
                              background: limitStatus.totalCount >= limitStatus.totalLimit ? '#ef4444' : 'var(--gradient)'
                            }} />
                        </div>
                        <span className={`text-[10px] font-bold w-10 text-right ${
                          limitStatus.totalCount >= limitStatus.totalLimit ? 'text-red-500' : 'text-slate-400'
                        }`}>{limitStatus.totalCount}/{limitStatus.totalLimit}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── RIGHT: Details Card ─────────────────── */}
            <div className="relative rounded-3xl overflow-hidden border border-white/20 dark:border-slate-700/40
              backdrop-blur-sm shadow-2xl">
              <div className="dark:hidden absolute inset-0 rounded-3xl"
                style={{ background: 'rgba(255,255,255,0.55)' }} />
              <div className="hidden dark:block absolute inset-0 rounded-3xl"
                style={{ background: 'rgba(9,15,40,0.6)' }} />

              <div className="relative z-10 p-5 h-full flex flex-col">
                {/* Card header */}
                <div className="flex items-center gap-2 mb-5">
                  <div className="h-8 w-8 rounded-xl flex items-center justify-center"
                    style={{ background: 'var(--gradient)' }}>
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-800 dark:text-white leading-none">Post Details</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Fill in the details below</p>
                  </div>
                </div>

                {loading ? (
                  <div className="flex-1 flex flex-col items-center justify-center gap-5 py-10">
                    {/* Spinner */}
                    <div className="relative h-20 w-20">
                      <div className="absolute inset-0 rounded-full"
                        style={{ border: '2px solid color-mix(in srgb, var(--primary) 20%, transparent)' }} />
                      <div className="absolute inset-0 rounded-full border-[2.5px] border-transparent animate-spin"
                        style={{ borderTopColor: 'var(--primary)' }} />
                      <div className="absolute inset-[6px] rounded-full opacity-25 animate-pulse"
                        style={{ background: 'var(--gradient)' }} />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Send className="h-6 w-6" style={{ color: 'var(--primary)' }} />
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Publishing your post...</p>
                      <p className="text-xs text-slate-400 mt-1">Sharing with the community</p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-4">

                    {/* Caption */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
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
                          {isMagicLoading ? 'Conjuring...' : '✨ Magic'}
                        </button>
                      </div>
                      <textarea
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        placeholder={isLimitReached ? "Upload limits exceeded." : "Write something captivating... ✨"}
                        rows={4}
                        maxLength={300}
                        disabled={isLimitReached}
                        className="input-premium"
                        style={isLimitReached ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                      />
                      <div className="flex items-center justify-between mt-1.5">
                        <div className="flex-1 h-0.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mr-3">
                          <div className="h-full rounded-full transition-all duration-300"
                            style={{
                              width: `${Math.min((caption.length / 300) * 100, 100)}%`,
                              background: caption.length > 270
                                ? 'linear-gradient(to right, #ef4444, #dc2626)'
                                : caption.length > 200
                                ? 'linear-gradient(to right, #f59e0b, #ef4444)'
                                : 'var(--gradient)'
                            }} />
                        </div>
                        <span className={`text-[10px] font-bold ${
                          caption.length > 270 ? 'text-red-500' : caption.length > 200 ? 'text-amber-500' : 'text-slate-400'
                        }`}>{caption.length}/300</span>
                      </div>
                    </div>

                    {/* Tags */}
                    <div>
                      <label className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.15em]
                        text-slate-400 mb-2">
                        <Tag className="h-3 w-3" /> Tags
                        <span className="font-normal normal-case text-slate-400 ml-1">(comma-separated)</span>
                      </label>
                      <input
                        type="text"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        placeholder="nature, summer, vibes, travel"
                        disabled={isLimitReached}
                        className="input-premium"
                        style={isLimitReached ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                      />
                      {tagList.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2.5">
                          {tagList.map((t, i) => (
                            <span key={i} className="tag-pill">#{t}</span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Caption preview */}
                    {preview && caption && (
                      <div className="p-3.5 rounded-2xl border border-white/20 dark:border-slate-700/30 animate-fade-in"
                        style={{ background: 'color-mix(in srgb, var(--primary) 5%, rgba(255,255,255,0.04))' }}>
                        <div className="flex items-start gap-2">
                          <Sparkles className="h-3.5 w-3.5 mt-0.5 shrink-0" style={{ color: 'var(--primary)' }} />
                          <p className="text-xs text-slate-600 dark:text-slate-300 italic leading-relaxed line-clamp-2">
                            "{caption}"
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Spacer */}
                    <div className="flex-1" />

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={isLimitReached}
                      className={`relative w-full py-4 px-6 text-white font-black rounded-2xl text-sm
                        transition-all duration-300 flex items-center justify-center gap-3 group overflow-hidden
                        ${isLimitReached
                          ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                          : 'shadow-xl glow-primary hover:scale-[1.02] active:scale-[0.98]'
                        }`}
                      style={!isLimitReached ? { background: 'var(--gradient)' } : {}}
                    >
                      {!isLimitReached && (
                        <>
                          {/* Shimmer overlay */}
                          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent
                            translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none" />
                        </>
                      )}
                      <Send className={`h-4 w-4 transition-all duration-300 ${
                        !isLimitReached ? 'group-hover:translate-x-1 group-hover:-translate-y-0.5' : ''
                      }`} />
                      <span>{isLimitReached ? 'Upload Disabled' : 'Publish to the World'}</span>
                    </button>

                  </form>
                )}
              </div>
            </div>
          </div>

          {/* ── Bottom Tips Row ──────────────────────────── */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-8 reveal-up reveal-up-5">
            {[
              { icon: '🎨', text: 'Edit your photo before publishing' },
              { icon: '✨', text: 'Use Magic Caption for instant ideas' },
              { icon: '🏷️', text: 'Add tags to reach more people' },
            ].map((tip, i) => (
              <div key={i} className="flex items-center gap-2 px-3.5 py-2 rounded-full
                border border-slate-200/60 dark:border-slate-700/40
                text-[11px] text-slate-500 dark:text-slate-400 font-medium backdrop-blur-sm"
                style={{ background: 'rgba(255,255,255,0.4)' }}>
                <span>{tip.icon}</span>
                <span>{tip.text}</span>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* ── Image Editor Modal ─────────────────────── */}
      {showEditor && rawImageSrc && (
        <ImageEditorModal
          imageSrc={rawImageSrc}
          onApply={handleEditorApply}
          onClose={() => setShowEditor(false)}
        />
      )}
    </>
  );
};

export default CreatePost;
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, RotateCcw, Check, Crop, Sliders, ZoomIn, ZoomOut } from 'lucide-react';

/* ─── Filter presets ────────────────────────────────────────────────── */
const FILTERS = [
  { id: 'original',   label: 'Original',   css: '' },
  { id: 'clarendon',  label: 'Clarendon',  css: 'contrast(1.2) saturate(1.35) brightness(1.05)' },
  { id: 'gingham',    label: 'Gingham',    css: 'brightness(1.05) hue-rotate(-10deg) sepia(0.08)' },
  { id: 'juno',       label: 'Juno',       css: 'saturate(1.4) contrast(1.1) brightness(1.08) sepia(0.06)' },
  { id: 'lark',       label: 'Lark',       css: 'brightness(1.1) contrast(0.9) saturate(1.15) hue-rotate(5deg)' },
  { id: 'ludwig',     label: 'Ludwig',     css: 'brightness(1.05) contrast(1.1) saturate(0.95) sepia(0.12)' },
  { id: 'bw',         label: 'B&W',        css: 'grayscale(1) contrast(1.1)' },
  { id: 'warm',       label: 'Warm',       css: 'sepia(0.3) saturate(1.2) brightness(1.05) hue-rotate(-5deg)' },
  { id: 'cool',       label: 'Cool',       css: 'saturate(0.9) brightness(1.05) hue-rotate(20deg) contrast(1.05)' },
  { id: 'fade',       label: 'Fade',       css: 'brightness(1.1) contrast(0.85) saturate(0.75) opacity(0.92)' },
  { id: 'vivid',      label: 'Vivid',      css: 'saturate(1.8) contrast(1.15) brightness(1.02)' },
  { id: 'matte',      label: 'Matte',      css: 'contrast(0.8) saturate(0.7) brightness(1.1) sepia(0.05)' },
];

/* ─── Build a CSS filter string from adjustments ────────────────────── */
const buildCssFilter = (filter, adj) => {
  const base = filter.css;
  const adjustStr = `brightness(${adj.brightness / 100}) contrast(${adj.contrast / 100}) saturate(${adj.saturation / 100})`;
  return base ? `${base} ${adjustStr}` : adjustStr;
};

/* ─── Canvas render helper ──────────────────────────────────────────── */
const renderToCanvas = (img, crop, filterCss, adj, outCanvas) => {
  const ctx = outCanvas.getContext('2d');
  outCanvas.width  = crop.w;
  outCanvas.height = crop.h;
  ctx.filter = buildCssFilter(filterCss, adj);
  ctx.drawImage(img, crop.x, crop.y, crop.w, crop.h, 0, 0, crop.w, crop.h);
  ctx.filter = 'none';
};

/* ═══════════════════════════════════════════════════════════════════ */
const ImageEditorModal = ({ imageSrc, onApply, onClose }) => {
  const [tab, setTab] = useState('filter'); // 'filter' | 'crop' | 'adjust'

  /* Filter */
  const [activeFilter, setActiveFilter] = useState(FILTERS[0]);

  /* Adjustments */
  const [adj, setAdj] = useState({ brightness: 100, contrast: 100, saturation: 100 });

  /* Crop state (in natural image coordinates) */
  const [crop, setCrop]           = useState(null);   // null = full image
  const [isCropping, setIsCropping] = useState(false);
  const cropStart = useRef(null);
  const [tempCrop, setTempCrop]   = useState(null);   // while dragging

  /* Refs */
  const imgRef   = useRef(null);
  const wrapRef  = useRef(null);
  const outCanvas = useRef(document.createElement('canvas'));

  /* Natural image dimensions */
  const [naturalSize, setNaturalSize] = useState({ w: 0, h: 0 });
  const [imgLoaded, setImgLoaded] = useState(false);

  /* Displayed crop overlay in CSS px */
  const displayCrop = useCallback(() => {
    if (!imgRef.current || !naturalSize.w) return null;
    const rect = imgRef.current.getBoundingClientRect();
    const scaleX = rect.width  / naturalSize.w;
    const scaleY = rect.height / naturalSize.h;
    const c = crop || { x: 0, y: 0, w: naturalSize.w, h: naturalSize.h };
    return {
      left:   c.x * scaleX,
      top:    c.y * scaleY,
      width:  c.w * scaleX,
      height: c.h * scaleY,
    };
  }, [crop, naturalSize]);

  const onImgLoad = (e) => {
    const { naturalWidth: w, naturalHeight: h } = e.target;
    setNaturalSize({ w, h });
    setCrop({ x: 0, y: 0, w, h });
    setImgLoaded(true);
  };

  /* ── Crop mouse handlers ── */
  const toNatural = (clientX, clientY) => {
    const rect = imgRef.current.getBoundingClientRect();
    const scaleX = naturalSize.w / rect.width;
    const scaleY = naturalSize.h / rect.height;
    return {
      x: Math.max(0, Math.min(naturalSize.w, (clientX - rect.left) * scaleX)),
      y: Math.max(0, Math.min(naturalSize.h, (clientY - rect.top)  * scaleY)),
    };
  };

  const onMouseDown = (e) => {
    if (tab !== 'crop') return;
    e.preventDefault();
    setIsCropping(true);
    const p = toNatural(e.clientX, e.clientY);
    cropStart.current = p;
    setTempCrop({ x: p.x, y: p.y, w: 0, h: 0 });
  };

  const onMouseMove = (e) => {
    if (!isCropping || !cropStart.current) return;
    const p = toNatural(e.clientX, e.clientY);
    const x = Math.min(cropStart.current.x, p.x);
    const y = Math.min(cropStart.current.y, p.y);
    const w = Math.abs(p.x - cropStart.current.x);
    const h = Math.abs(p.y - cropStart.current.y);
    setTempCrop({ x, y, w, h });
  };

  const onMouseUp = () => {
    if (!isCropping) return;
    setIsCropping(false);
    if (tempCrop && tempCrop.w > 10 && tempCrop.h > 10) {
      setCrop(tempCrop);
    }
    setTempCrop(null);
    cropStart.current = null;
  };

  /* Touch equivalents */
  const onTouchStart = (e) => onMouseDown(e.touches[0]);
  const onTouchMove  = (e) => { e.preventDefault(); onMouseMove(e.touches[0]); };
  const onTouchEnd   = ()  => onMouseUp();

  const resetCrop = () => setCrop({ x: 0, y: 0, w: naturalSize.w, h: naturalSize.h });

  /* ── Apply ── */
  const handleApply = () => {
    if (!imgRef.current || !imgLoaded) return;
    const img   = imgRef.current;
    const useCrop = crop || { x: 0, y: 0, w: naturalSize.w, h: naturalSize.h };
    renderToCanvas(img, useCrop, activeFilter, adj, outCanvas.current);
    outCanvas.current.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], 'edited-image.jpg', { type: 'image/jpeg' });
      onApply(file, URL.createObjectURL(blob));
    }, 'image/jpeg', 0.92);
  };

  /* Preview filter string */
  const previewFilter = buildCssFilter(activeFilter, adj);

  /* Active overlay */
  const overlay = displayCrop();
  const activeCropRect = (tab === 'crop' && overlay) ? (tempCrop ? (() => {
    if (!imgRef.current || !naturalSize.w) return null;
    const rect = imgRef.current.getBoundingClientRect();
    const scaleX = rect.width  / naturalSize.w;
    const scaleY = rect.height / naturalSize.h;
    return { left: tempCrop.x * scaleX, top: tempCrop.y * scaleY, width: tempCrop.w * scaleX, height: tempCrop.h * scaleY };
  })() : overlay) : null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-4xl max-h-[95vh] rounded-3xl overflow-hidden flex flex-col
          bg-white dark:bg-[#0a0f1e] shadow-2xl border border-white/10 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--gradient)' }}>
              <Sliders className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white leading-none">Edit Photo</h2>
              <p className="text-[10px] text-slate-400 mt-0.5">Crop, filter &amp; adjust before posting</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center
              text-slate-500 hover:text-red-500 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="flex flex-col md:flex-row flex-1 min-h-0 overflow-hidden">

          {/* Image preview area */}
          <div className="relative flex-1 bg-slate-950 flex items-center justify-center overflow-hidden min-h-[260px] md:min-h-0 select-none"
            ref={wrapRef}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
          >
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Edit preview"
              onLoad={onImgLoad}
              draggable={false}
              onMouseDown={onMouseDown}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
              className="max-w-full max-h-[50vh] md:max-h-full object-contain block"
              style={{
                filter: previewFilter,
                cursor: tab === 'crop' ? 'crosshair' : 'default',
                userSelect: 'none',
                WebkitUserDrag: 'none',
              }}
            />

            {/* Crop overlay */}
            {tab === 'crop' && overlay && imgLoaded && (
              <>
                {/* Dimmed areas */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-0 bg-black/50" style={{
                    clipPath: activeCropRect
                      ? `polygon(0 0, 100% 0, 100% 100%, 0 100%,
                          0 ${activeCropRect.top}px,
                          ${activeCropRect.left}px ${activeCropRect.top}px,
                          ${activeCropRect.left}px ${activeCropRect.top + activeCropRect.height}px,
                          ${activeCropRect.left + activeCropRect.width}px ${activeCropRect.top + activeCropRect.height}px,
                          ${activeCropRect.left + activeCropRect.width}px ${activeCropRect.top}px,
                          0 ${activeCropRect.top}px)`
                      : undefined
                  }} />
                </div>
                {/* Crop border */}
                {activeCropRect && (
                  <div
                    className="absolute pointer-events-none border-2 border-white/80"
                    style={{
                      left: activeCropRect.left,
                      top:  activeCropRect.top,
                      width: activeCropRect.width,
                      height: activeCropRect.height,
                    }}
                  >
                    {/* Rule-of-thirds grid */}
                    <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
                      {Array.from({ length: 9 }).map((_, i) => (
                        <div key={i} className="border border-white/20" />
                      ))}
                    </div>
                    {/* Corner handles */}
                    {[['-top-1 -left-1', 'tl'], ['-top-1 -right-1', 'tr'], ['-bottom-1 -left-1', 'bl'], ['-bottom-1 -right-1', 'br']].map(([pos]) => (
                      <div key={pos} className={`absolute ${pos} h-3 w-3 bg-white rounded-sm`} />
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Crop hint */}
            {tab === 'crop' && imgLoaded && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-xl
                bg-black/60 backdrop-blur text-white text-[11px] font-semibold pointer-events-none">
                Drag to crop your photo
              </div>
            )}
          </div>

          {/* Controls panel */}
          <div className="w-full md:w-72 flex flex-col border-t md:border-t-0 md:border-l
            border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0a0f1e] shrink-0">

            {/* Tab switcher */}
            <div className="flex border-b border-slate-100 dark:border-slate-800 shrink-0">
              {[
                { id: 'filter', label: 'Filter', Icon: Sliders },
                { id: 'crop',   label: 'Crop',   Icon: Crop },
                { id: 'adjust', label: 'Adjust', Icon: ZoomIn },
              ].map(({ id, label, Icon }) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={`flex-1 flex flex-col items-center gap-1 py-3 text-[11px] font-bold
                    transition-all duration-200 border-b-2
                    ${tab === id
                      ? 'border-current text-white'
                      : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                    }`}
                  style={tab === id ? { borderColor: 'var(--primary)', color: 'var(--primary)' } : {}}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">

              {/* ── Filter tab ── */}
              {tab === 'filter' && (
                <div className="grid grid-cols-3 gap-2">
                  {FILTERS.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setActiveFilter(f)}
                      className={`relative flex flex-col items-center gap-1.5 rounded-2xl p-2
                        transition-all duration-200
                        ${activeFilter.id === f.id
                          ? 'ring-2 bg-slate-50 dark:bg-slate-800/60'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'
                        }`}
                      style={activeFilter.id === f.id ? { '--tw-ring-color': 'var(--primary)' } : {}}
                    >
                      <div className="w-full aspect-square rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-700">
                        <img
                          src={imageSrc}
                          alt={f.label}
                          className="w-full h-full object-cover"
                          style={{ filter: f.css || 'none' }}
                          draggable={false}
                        />
                      </div>
                      <span className={`text-[10px] font-bold truncate w-full text-center
                        ${activeFilter.id === f.id ? '' : 'text-slate-500 dark:text-slate-400'}`}
                        style={activeFilter.id === f.id ? { color: 'var(--primary)' } : {}}>
                        {f.label}
                      </span>
                      {activeFilter.id === f.id && (
                        <div className="absolute top-1.5 right-1.5 h-3.5 w-3.5 rounded-full flex items-center justify-center"
                          style={{ background: 'var(--gradient)' }}>
                          <Check className="h-2 w-2 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* ── Crop tab ── */}
              {tab === 'crop' && (
                <div className="space-y-4">
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Drag on the image to select a crop region. A rule-of-thirds grid will guide you.
                  </p>

                  {/* Current crop info */}
                  {crop && (
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Crop Region</p>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                        {Math.round(crop.w)} × {Math.round(crop.h)} px
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Offset: ({Math.round(crop.x)}, {Math.round(crop.y)})
                      </p>
                    </div>
                  )}

                  {/* Preset aspect ratios */}
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Presets</p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: 'Square 1:1',     ratio: [1, 1] },
                        { label: 'Portrait 4:5',   ratio: [4, 5] },
                        { label: 'Landscape 16:9', ratio: [16, 9] },
                        { label: 'Full Image',     ratio: null },
                      ].map(({ label, ratio }) => (
                        <button
                          key={label}
                          onClick={() => {
                            if (!ratio) { resetCrop(); return; }
                            const [rw, rh] = ratio;
                            const maxW = naturalSize.w;
                            const maxH = naturalSize.h;
                            let w = maxW, h = w * rh / rw;
                            if (h > maxH) { h = maxH; w = h * rw / rh; }
                            const x = (maxW - w) / 2;
                            const y = (maxH - h) / 2;
                            setCrop({ x, y, w, h });
                          }}
                          className="px-2 py-2 rounded-xl text-[10px] font-bold
                            bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300
                            hover:text-white transition-all duration-200 hover:scale-105"
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--gradient)'}
                          onMouseLeave={e => e.currentTarget.style.background = ''}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={resetCrop}
                    className="flex items-center gap-2 text-xs font-bold text-slate-400
                      hover:text-red-500 transition-colors"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Reset Crop
                  </button>
                </div>
              )}

              {/* ── Adjust tab ── */}
              {tab === 'adjust' && (
                <div className="space-y-5">
                  {[
                    { key: 'brightness', label: 'Brightness', min: 50, max: 200, icon: '☀️' },
                    { key: 'contrast',   label: 'Contrast',   min: 50, max: 200, icon: '◑' },
                    { key: 'saturation', label: 'Saturation', min: 0,  max: 200, icon: '🎨' },
                  ].map(({ key, label, min, max, icon }) => (
                    <div key={key} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                          <span>{icon}</span> {label}
                        </label>
                        <span className="text-[11px] font-bold" style={{ color: 'var(--primary)' }}>
                          {adj[key]}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min={min}
                        max={max}
                        value={adj[key]}
                        onChange={(e) => setAdj(prev => ({ ...prev, [key]: Number(e.target.value) }))}
                        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, var(--primary) 0%, var(--primary) ${((adj[key] - min) / (max - min)) * 100}%, rgba(148,163,184,0.3) ${((adj[key] - min) / (max - min)) * 100}%, rgba(148,163,184,0.3) 100%)`,
                        }}
                      />
                    </div>
                  ))}

                  <button
                    onClick={() => setAdj({ brightness: 100, contrast: 100, saturation: 100 })}
                    className="flex items-center gap-2 text-xs font-bold text-slate-400
                      hover:text-red-500 transition-colors mt-2"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Reset Adjustments
                  </button>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex gap-3 shrink-0">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-2xl text-sm font-bold
                  bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300
                  hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                disabled={!imgLoaded}
                className="flex-1 py-2.5 rounded-2xl text-sm font-bold text-white
                  shadow-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50
                  flex items-center justify-center gap-2"
                style={{ background: 'var(--gradient)' }}
              >
                <Check className="h-4 w-4" />
                Apply &amp; Use
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--primary);
          cursor: pointer;
          box-shadow: 0 0 6px color-mix(in srgb, var(--primary) 50%, transparent);
        }
        input[type=range]::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--primary);
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
};

export default ImageEditorModal;

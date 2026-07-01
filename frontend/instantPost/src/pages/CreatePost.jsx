import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { UploadCloud, X, Send, Sparkles, Image, Clock, AlertCircle } from 'lucide-react';

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

    const fetchLimitStatus = async () => {
        try {
            // const res = await axios.get("http://localhost:3000/posts/limit-status"); // this i made for the local host
            const res = await axios.get("https://instapost-nb20.onrender.com/posts/limit-status")
            setLimitStatus(res.data);
        } catch (error) {
            console.error("Failed to fetch limit status:", error);
        }
    };

    useEffect(() => {
        fetchLimitStatus();
    }, []);

    const getRemainingTimeStr = (availableAtStr) => {
        if (!availableAtStr) return '';
        const diffMs = new Date(availableAtStr) - new Date();
        if (diffMs <= 0) return 'Available now';
        
        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        
        if (diffHrs > 0) {
            return `${diffHrs}h ${diffMins}m`;
        }
        return `${diffMins}m`;
    };

    const handleFile = (file) => {
        if (!file.type.startsWith('image/')) {
            showToast('Please select a valid image file', 'error');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            showToast('Image size must be less than 5MB', 'error');
            return;
        }
        setImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result);
        reader.readAsDataURL(file);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) handleFile(file);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    };

    const removeSelectedImage = () => {
        setPreview(null);
        setImageFile(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (limitStatus) {
            if (limitStatus.totalCount >= limitStatus.totalLimit) {
                showToast('Total photo limit reached. Delete some photos to add more.', 'error');
                return;
            }
            if (limitStatus.dailyCount >= limitStatus.dailyLimit) {
                showToast('Daily upload limit reached. Please try again later.', 'error');
                return;
            }
        }

        if (!imageFile) {
            showToast('Please select or drag an image', 'error');
            return;
        }
        if (!caption.trim()) {
            showToast('Please write an interesting caption', 'error');
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('image', imageFile);
        formData.append('caption', caption.trim());
        formData.append('tags', tags.trim());

        try {
            // await axios.post("http://localhost:3000/create-post", formData);  for localhost
            await axios.post("https://instapost-nb20.onrender.com/create-post", formData);
            showToast('Post shared with the world!', 'success');
            setTimeout(() => navigate("/feed"), 1000);
        } catch (error) {
            console.error(error);
            const errMsg = error.response?.data?.message || 'Failed to create post. Please try again.';
            showToast(errMsg, 'error');
        } finally {
            setLoading(false);
        }
    };

    const isLimitReached = limitStatus 
        ? (limitStatus.totalCount >= limitStatus.totalLimit || limitStatus.dailyCount >= limitStatus.dailyLimit)
        : false;

    return (
        <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full opacity-20 blur-3xl pointer-events-none animate-float"
                style={{ background: 'var(--gradient)' }}
            />
            <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-80 h-80 rounded-full opacity-20 blur-3xl pointer-events-none"
                style={{ background: 'var(--gradient)' }}
            />

            <div className="relative w-full max-w-lg animate-slide-up">
                <div className="glass-card rounded-2xl p-6 sm:p-8 shadow-xl">
                    {/* Header */}
                    <div className="text-center mb-6">
                        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-lg mb-3"
                            style={{ background: 'var(--gradient)' }}
                        >
                            <Sparkles className="h-6 w-6" />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Create Post</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Share a moment with the community</p>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-16">
                            <div className="relative h-14 w-14">
                                <div className="absolute inset-0 rounded-full opacity-20"
                                    style={{ border: '3px solid var(--primary)' }}
                                />
                                <div className="absolute inset-0 rounded-full border-3 border-transparent animate-spin"
                                    style={{ borderTopColor: 'var(--primary)' }}
                                />
                            </div>
                            <p className="mt-5 text-sm font-medium text-slate-500 dark:text-slate-400">
                                Uploading & creating post...
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Upload Limit Stats Display */}
                            {limitStatus && (
                                <div className="p-4 rounded-xl bg-slate-50/50 dark:bg-slate-900/30 border border-slate-200/60 dark:border-slate-800/40 text-xs space-y-3">
                                    <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                                        <span className="font-semibold uppercase tracking-wider text-[10px]">Upload Quota Overview</span>
                                        <span className="font-medium text-slate-400">{Math.max(0, limitStatus.totalLimit - limitStatus.totalCount)} slots remaining</span>
                                    </div>
                                    
                                    {/* Daily limit progress bar */}
                                    <div className="space-y-1">
                                        <div className="flex justify-between">
                                            <span className="text-slate-700 dark:text-slate-300 font-medium">Daily Uploads (24h window)</span>
                                            <span className={`font-semibold ${limitStatus.dailyCount >= limitStatus.dailyLimit ? 'text-amber-500 font-bold' : 'text-slate-700 dark:text-slate-300'}`}>
                                                {limitStatus.dailyCount} / {limitStatus.dailyLimit}
                                            </span>
                                        </div>
                                        <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                            <div 
                                                className="h-full rounded-full transition-all duration-500" 
                                                style={{ 
                                                    width: `${Math.min((limitStatus.dailyCount / limitStatus.dailyLimit) * 100, 100)}%`,
                                                    background: limitStatus.dailyCount >= limitStatus.dailyLimit 
                                                        ? 'linear-gradient(to right, #f59e0b, #ef4444)' 
                                                        : 'var(--gradient)'
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* Total limit progress bar */}
                                    <div className="space-y-1">
                                        <div className="flex justify-between">
                                            <span className="text-slate-700 dark:text-slate-300 font-medium">Total Saved Photos</span>
                                            <span className={`font-semibold ${limitStatus.totalCount >= limitStatus.totalLimit ? 'text-red-500 font-bold' : 'text-slate-700 dark:text-slate-300'}`}>
                                                {limitStatus.totalCount} / {limitStatus.totalLimit}
                                            </span>
                                        </div>
                                        <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                            <div 
                                                className="h-full rounded-full transition-all duration-500" 
                                                style={{ 
                                                    width: `${Math.min((limitStatus.totalCount / limitStatus.totalLimit) * 100, 100)}%`,
                                                    background: limitStatus.totalCount >= limitStatus.totalLimit 
                                                        ? '#ef4444' 
                                                        : 'var(--gradient)'
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* Dynamic Alerts */}
                                    {limitStatus.totalCount >= limitStatus.totalLimit && (
                                        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 mt-2 animate-fade-in">
                                            <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                                            <div>
                                                <p className="font-semibold">Storage Space Full</p>
                                                <p className="mt-0.5 text-[11px] opacity-90 leading-relaxed">
                                                    You have reached the maximum allowed limit of 15 photos. 
                                                    Please <button type="button" onClick={() => navigate('/feed')} className="underline font-bold hover:text-red-700 dark:hover:text-red-300">delete some photos</button> in the feed to make space.
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {limitStatus.totalCount < limitStatus.totalLimit && limitStatus.dailyCount >= limitStatus.dailyLimit && (
                                        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 mt-2 animate-fade-in">
                                            <Clock className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                                            <div>
                                                <p className="font-semibold">Daily Limit Reached</p>
                                                <p className="mt-0.5 text-[11px] opacity-90 leading-relaxed">
                                                    You've uploaded 3 photos in the last 24 hours. Next upload slot becomes available in{' '}
                                                    <span className="font-bold">{getRemainingTimeStr(limitStatus.nextUploadAvailableAt)}</span>.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Image Upload */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                                    Photo
                                </label>
                                
                                {!preview ? (
                                    <div
                                        onDragOver={isLimitReached ? undefined : handleDragOver}
                                        onDragLeave={isLimitReached ? undefined : handleDragLeave}
                                        onDrop={isLimitReached ? undefined : handleDrop}
                                        className={`relative flex flex-col items-center justify-center h-56 border-2 border-dashed rounded-xl transition-all duration-300 ${
                                            isLimitReached
                                                ? 'bg-slate-100/50 dark:bg-slate-900/10 border-slate-200 dark:border-slate-800 cursor-not-allowed'
                                                : isDragOver 
                                                    ? 'scale-[0.99]'
                                                    : 'hover:bg-slate-50/50 dark:hover:bg-slate-900/40 cursor-pointer'
                                        }`}
                                        style={{
                                            borderColor: !isLimitReached && isDragOver ? 'var(--primary)' : undefined,
                                            backgroundColor: !isLimitReached && isDragOver ? 'color-mix(in srgb, var(--primary) 8%, transparent)' : undefined,
                                        }}
                                    >
                                        <input
                                            type="file"
                                            name="image"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            disabled={isLimitReached}
                                            className={`absolute inset-0 w-full h-full opacity-0 z-10 ${isLimitReached ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                        />
                                        <div className="flex flex-col items-center text-center p-4">
                                            <div className="h-12 w-12 rounded-xl flex items-center justify-center mb-3"
                                                style={{ background: isLimitReached ? 'rgba(148, 163, 184, 0.1)' : 'var(--primary-100)' }}
                                            >
                                                <UploadCloud className="h-6 w-6" style={{ color: isLimitReached ? '#94a3b8' : 'var(--primary)' }} />
                                            </div>
                                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                {isLimitReached ? 'Upload Disabled' : 'Drag & drop or click to browse'}
                                            </p>
                                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                                                {isLimitReached ? 'Limits exceeded' : 'JPG, PNG, GIF up to 5MB'}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
                                        <img
                                            src={preview}
                                            alt="Preview"
                                            className="w-full h-64 object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                                            <button
                                                type="button"
                                                onClick={removeSelectedImage}
                                                className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium text-sm transition-all shadow-lg transform translate-y-2 group-hover:translate-y-0"
                                            >
                                                <X className="h-4 w-4" />
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Caption */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                                    Caption
                                </label>
                                <textarea
                                    value={caption}
                                    onChange={(e) => setCaption(e.target.value)}
                                    placeholder={isLimitReached ? "Upload limits exceeded. Please resolve limits to post." : "Write something captivating..."}
                                    rows={3}
                                    disabled={isLimitReached}
                                    className={`w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700/60 text-slate-900 dark:text-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all resize-none text-sm ${
                                        isLimitReached 
                                            ? 'bg-slate-100/50 dark:bg-slate-900/10 cursor-not-allowed text-slate-400' 
                                            : 'bg-white/60 dark:bg-slate-900/60'
                                    }`}
                                    onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                                    onBlur={(e) => e.target.style.borderColor = ''}
                                />
                            </div>

                            {/* Tags */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                                    Tags <span className="font-normal normal-case text-slate-400">(comma-separated)</span>
                                </label>
                                <input
                                    type="text"
                                    value={tags}
                                    onChange={(e) => setTags(e.target.value)}
                                    placeholder="nature, summer, vibes"
                                    disabled={isLimitReached}
                                    className={`w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700/60 text-slate-900 dark:text-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all text-sm ${
                                        isLimitReached 
                                            ? 'bg-slate-100/50 dark:bg-slate-900/10 cursor-not-allowed text-slate-400' 
                                            : 'bg-white/60 dark:bg-slate-900/60'
                                    }`}
                                    onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                                    onBlur={(e) => e.target.style.borderColor = ''}
                                />
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={isLimitReached}
                                className={`w-full py-3 px-6 text-white font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group shadow-lg ${
                                    isLimitReached 
                                        ? 'bg-slate-300 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed shadow-none hover:scale-100' 
                                        : 'hover:scale-[1.01] active:scale-[0.99]'
                                }`}
                                style={{ background: isLimitReached ? 'none' : 'var(--gradient)' }}
                            >
                                <Send className={`h-4 w-4 transition-transform ${isLimitReached ? '' : 'group-hover:translate-x-1 group-hover:-translate-y-0.5'}`} />
                                Publish Post
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreatePost;
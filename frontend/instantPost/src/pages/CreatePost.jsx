import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { UploadCloud, X, Send, Sparkles, Image } from 'lucide-react';

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
            await axios.post("http://localhost:3000/create-post", formData);
            showToast('Post shared with the world!', 'success');
            setTimeout(() => navigate("/feed"), 1000);
        } catch (error) {
            console.error(error);
            showToast('Failed to create post. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

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
                            {/* Image Upload */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                                    Photo
                                </label>
                                
                                {!preview ? (
                                    <div
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onDrop={handleDrop}
                                        className={`relative flex flex-col items-center justify-center h-56 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 ${
                                            isDragOver 
                                                ? 'scale-[0.99]'
                                                : 'hover:bg-slate-50/50 dark:hover:bg-slate-900/40'
                                        }`}
                                        style={{
                                            borderColor: isDragOver ? 'var(--primary)' : undefined,
                                            backgroundColor: isDragOver ? 'color-mix(in srgb, var(--primary) 8%, transparent)' : undefined,
                                        }}
                                    >
                                        <input
                                            type="file"
                                            name="image"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        />
                                        <div className="flex flex-col items-center text-center p-4">
                                            <div className="h-12 w-12 rounded-xl flex items-center justify-center mb-3"
                                                style={{ background: 'var(--primary-100)' }}
                                            >
                                                <UploadCloud className="h-6 w-6" style={{ color: 'var(--primary)' }} />
                                            </div>
                                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                Drag & drop or click to browse
                                            </p>
                                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                                                JPG, PNG, GIF up to 5MB
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
                                    placeholder="Write something captivating..."
                                    rows={3}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white/60 dark:bg-slate-900/60 text-slate-900 dark:text-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all resize-none text-sm"
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
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white/60 dark:bg-slate-900/60 text-slate-900 dark:text-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all text-sm"
                                    onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                                    onBlur={(e) => e.target.style.borderColor = ''}
                                />
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                className="w-full py-3 px-6 text-white font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group hover:scale-[1.01] active:scale-[0.99] shadow-lg"
                                style={{ background: 'var(--gradient)' }}
                            >
                                <Send className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-0.5" />
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
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { UploadCloud, X, Image as ImageIcon, Send, Sparkles } from 'lucide-react';

const CreatePost = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
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
        <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
            {/* Background Decorative Blobs */}
            <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-indigo-500/10 dark:bg-indigo-500/5 blur-3xl pointer-events-none animate-float" />
            <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-80 h-80 rounded-full bg-pink-500/10 dark:bg-pink-500/5 blur-3xl pointer-events-none" style={{ animationDelay: '2s' }} />

            <div className="relative w-full max-w-xl rounded-3xl border border-slate-200/80 bg-white/80 p-8 shadow-xl backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/60 dark:shadow-2xl/40 transition-all duration-300 animate-slide-up">
                
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500 dark:bg-indigo-400/10 dark:text-indigo-400 mb-3">
                        <Sparkles className="h-6 w-6" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white">Create New Post</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Share your best moments with your gallery</p>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="relative h-16 w-16">
                            <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20" />
                            <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
                        </div>
                        <p className="mt-6 text-sm font-medium text-slate-600 dark:text-slate-400">Uploading media & creating post...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Image Upload Area */}
                        <div>
                            <span className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Upload Photo</span>
                            
                            {!preview ? (
                                <div
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    className={`relative flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 ${
                                        isDragOver 
                                            ? 'border-indigo-500 bg-indigo-500/5 dark:bg-indigo-500/5 scale-[0.99]' 
                                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 dark:border-slate-800 dark:hover:border-slate-700 dark:hover:bg-slate-900/40'
                                    }`}
                                >
                                    <input
                                        type="file"
                                        name="image"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    />
                                    <div className="flex flex-col items-center text-center p-4">
                                        <div className="h-12 w-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 mb-4">
                                            <UploadCloud className="h-6 w-6 text-indigo-500" />
                                        </div>
                                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                            Drag & drop image here
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                                            or click to browse files
                                        </p>
                                        <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-4">
                                            Supports JPG, PNG, GIF up to 5MB
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div className="relative group rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
                                    <img
                                        src={preview}
                                        alt="Preview"
                                        className="w-full h-72 object-cover"
                                    />
                                    {/* Overlay Options */}
                                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                                        <button
                                            type="button"
                                            onClick={removeSelectedImage}
                                            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium text-sm transition-all shadow-lg transform translate-y-2 group-hover:translate-y-0"
                                        >
                                            <X className="h-4 w-4" />
                                            Remove Image
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Caption Field */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Caption</label>
                            <textarea
                                value={caption}
                                onChange={(e) => setCaption(e.target.value)}
                                placeholder="Write something captivating about this moment..."
                                rows={3}
                                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/40 text-slate-900 dark:text-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
                            />
                        </div>

                        {/* Tags Field */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                Tags / Hashtags <span className="text-xs font-normal text-slate-400 dark:text-slate-500">(comma-separated)</span>
                            </label>
                            <input
                                type="text"
                                value={tags}
                                onChange={(e) => setTags(e.target.value)}
                                placeholder="e.g. nature, summer, vibes"
                                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/40 text-slate-900 dark:text-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="w-full py-4 px-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-bold rounded-2xl hover:from-indigo-600 hover:to-pink-600 hover:shadow-lg hover:shadow-indigo-500/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-300 flex items-center justify-center gap-2 group"
                        >
                            <Send className="h-4.w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-0.5" />
                            Publish Post
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default CreatePost;
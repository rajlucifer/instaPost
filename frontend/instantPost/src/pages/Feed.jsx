import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { Search, Heart, Share2, Download, Copy, LayoutGrid, AlertCircle, PlusCircle } from 'lucide-react';

const Feed = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [likedPosts, setLikedPosts] = useState({});
    const [likeCounts, setLikeCounts] = useState({});
    const navigate = useNavigate();
    const { showToast } = useToast();

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await axios.get("http://localhost:3000/posts");
            const data = res.data.data || [];
            setPosts(data);

            // Initialize like state and random base count for aesthetic reality
            const initialLikes = JSON.parse(localStorage.getItem('likedPosts') || '{}');
            setLikedPosts(initialLikes);

            const initialCounts = {};
            data.forEach(post => {
                // Generate a stable random-ish base like count based on post ID string length or charcodes
                let hash = 0;
                for (let i = 0; i < post._id.length; i++) {
                    hash = post._id.charCodeAt(i) + ((hash << 5) - hash);
                }
                const baseLikes = Math.abs(hash % 245) + 12;
                initialCounts[post._id] = baseLikes + (initialLikes[post._id] ? 1 : 0);
            });
            setLikeCounts(initialCounts);
        } catch (error) {
            console.error(error);
            showToast('Failed to load feed posts', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const toggleLike = (postId) => {
        const currentLiked = !!likedPosts[postId];
        const newLiked = { ...likedPosts, [postId]: !currentLiked };
        setLikedPosts(newLiked);
        localStorage.setItem('likedPosts', JSON.stringify(newLiked));

        setLikeCounts(prev => ({
            ...prev,
            [postId]: prev[postId] + (currentLiked ? -1 : 1)
        }));

        if (!currentLiked) {
            showToast('Added to your favorites!', 'success');
        }
    };

    const handleCopyCaption = (caption) => {
        navigator.clipboard.writeText(caption);
        showToast('Caption copied to clipboard!', 'success');
    };

    const handleShare = (post) => {
        if (navigator.share) {
            navigator.share({
                title: 'InstaPost Share',
                text: post.caption,
                url: post.image,
            }).catch(console.error);
        } else {
            navigator.clipboard.writeText(post.image);
            showToast('Image URL copied to clipboard! Share it anywhere.', 'success');
        }
    };

    const handleDownload = async (imageUrl, caption) => {
        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `${caption.toLowerCase().replace(/\s+/g, '-').slice(0, 20)}.jpg`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            showToast('Image download started!', 'success');
        } catch (error) {
            // Fallback: open in new tab
            window.open(imageUrl, '_blank');
            showToast('Opening image in a new tab...', 'info');
        }
    };

    // Filter posts by search query
    const filteredPosts = posts.filter(post => 
        post.caption.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="mx-auto max-w-6xl px-6 py-10 transition-colors duration-300">
            {/* Gallery Intro Banner */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10 pb-8 border-b border-slate-200 dark:border-slate-800/80">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-900 bg-clip-text text-transparent dark:from-white dark:via-slate-200 dark:to-indigo-300">
                        Feed Gallery
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
                        Discover and explore beautiful moments captured by the community
                    </p>
                </div>

                {/* Create post CTA */}
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/35 transition-all duration-300 transform hover:scale-[1.02] cursor-pointer"
                >
                    <PlusCircle className="h-4.w-4" />
                    New Post
                </button>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-8">
                <div className="relative w-full sm:max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search posts by caption..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                    />
                </div>
                <div className="flex items-center gap-2 self-end sm:self-auto text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 px-4 py-2.5 rounded-xl border border-slate-200/50 dark:border-slate-800/60">
                    <LayoutGrid className="h-3.5 w-3.5" />
                    <span>Showing {filteredPosts.length} posts</span>
                </div>
            </div>

            {/* Content Feed Section */}
            {loading ? (
                /* Skeleton Loader Grid */
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="rounded-3xl border border-slate-200/60 dark:border-slate-800/80 bg-white/40 dark:bg-slate-900/30 overflow-hidden animate-pulse">
                            <div className="h-72 bg-slate-200 dark:bg-slate-800" />
                            <div className="p-5 space-y-3">
                                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
                                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : filteredPosts.length > 0 ? (
                /* Post Cards Grid */
                <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 items-start justify-center">
                    {filteredPosts.map((post) => (
                        <article
                            key={post._id}
                            className="group relative flex flex-col rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 overflow-hidden shadow-sm hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-700/80 transition-all duration-300"
                        >
                            {/* Image Container with Zoom hover effect */}
                            <div className="image-zoom-container relative h-72 w-full overflow-hidden bg-slate-100 dark:bg-slate-950">
                                <img
                                    className="w-full h-full object-cover"
                                    src={post.image}
                                    alt={post.caption}
                                    loading="lazy"
                                />
                                
                                {/* Overlay Top Actions (like Quick Action Toolbar) */}
                                <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                                    <button
                                        onClick={() => handleDownload(post.image, post.caption)}
                                        title="Download Image"
                                        className="h-9 w-9 flex items-center justify-center bg-white/90 dark:bg-slate-950/80 backdrop-blur text-slate-700 dark:text-slate-300 hover:text-indigo-500 rounded-xl hover:scale-105 transition-all shadow-md"
                                    >
                                        <Download className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => handleCopyCaption(post.caption)}
                                        title="Copy Caption"
                                        className="h-9 w-9 flex items-center justify-center bg-white/90 dark:bg-slate-950/80 backdrop-blur text-slate-700 dark:text-slate-300 hover:text-indigo-500 rounded-xl hover:scale-105 transition-all shadow-md"
                                    >
                                        <Copy className="h-4 w-4" />
                                    </button>
                                </div>

                                {/* Custom Bottom Overlay Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                            </div>

                            {/* Details & Actions Footer */}
                            <div className="p-5 flex flex-col justify-between flex-1">
                                {/* Title/Caption */}
                                <div className="mb-4">
                                    <p className="text-slate-800 dark:text-slate-200 font-medium text-sm leading-relaxed first-letter:uppercase">
                                        {post.caption}
                                    </p>
                                </div>

                                {/* Interactive Action Area */}
                                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800/80">
                                    {/* Like Button */}
                                    <button
                                        onClick={() => toggleLike(post._id)}
                                        className={`flex items-center gap-2 text-sm font-semibold transition-colors duration-200 cursor-pointer ${
                                            likedPosts[post._id]
                                                ? 'text-pink-500'
                                                : 'text-slate-500 hover:text-pink-500 dark:text-slate-400'
                                        }`}
                                    >
                                        <Heart
                                            className={`h-5 w-5 transition-transform ${
                                                likedPosts[post._id] ? 'fill-pink-500 scale-110' : 'hover:scale-105'
                                            }`}
                                        />
                                        <span>{likeCounts[post._id] || 0}</span>
                                    </button>

                                    {/* Share Button */}
                                    <button
                                        onClick={() => handleShare(post)}
                                        className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-indigo-500 dark:text-slate-400 cursor-pointer transition-colors duration-200"
                                    >
                                        <Share2 className="h-4 w-4" />
                                        <span className="hidden sm:inline">Share</span>
                                    </button>
                                </div>
                            </div>
                        </article>
                    ))}
                </section>
            ) : (
                /* Beautiful Empty State */
                <div className="flex flex-col items-center justify-center py-20 px-4 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/40 dark:bg-slate-900/30 text-center">
                    <div className="h-14 w-14 rounded-2xl bg-indigo-500/10 dark:bg-indigo-400/10 flex items-center justify-center text-indigo-500 dark:text-indigo-400 mb-6">
                        <AlertCircle className="h-6 w-6" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                        {searchTerm ? 'No search results found' : 'Gallery is empty'}
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-sm">
                        {searchTerm 
                            ? `We couldn't find any posts matching "${searchTerm}". Try checking your spelling or searching for another keyword.`
                            : "Be the first to share an inspiring moment! Click the button below to upload your first image."
                        }
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-xl shadow-md transition-all"
                    >
                        Create Your First Post
                    </button>
                </div>
            )}
        </div>
    );
};

export default Feed;
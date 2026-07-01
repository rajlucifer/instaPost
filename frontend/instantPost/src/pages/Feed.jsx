import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { 
    Search, Heart, Share2, Download, Copy, LayoutGrid, 
    AlertCircle, PlusCircle, X, ChevronLeft, ChevronRight, 
    SlidersHorizontal, TrendingUp, Sparkles, Trash2, Clock
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
        const now = new Date();
        const past = new Date(dateStr);
        const diffInSeconds = Math.floor((now - past) / 1000);
        
        if (diffInSeconds < 60) return 'just now';
        
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}h ago`;
        
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays}d ago`;
        
        return past.toLocaleDateString();
    };

    const allTags = React.useMemo(() => {
        const tagsSet = new Set();
        posts.forEach(post => {
            if (post.tags && Array.isArray(post.tags)) {
                post.tags.forEach(tag => tagsSet.add(tag.toLowerCase()));
            }
        });
        return Array.from(tagsSet);
    }, [posts]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // const res = await axios.get("http://localhost:3000/posts"); local connection
            const res = await axios.get("https://insta-post-6t1u.vercel.app/posts");
            const data = res.data.data || [];
            setPosts(data);

            const initialLikes = JSON.parse(localStorage.getItem('likedPosts') || '{}');
            setLikedPosts(initialLikes);

            const initialCounts = {};
            data.forEach(post => {
                initialCounts[post._id] = post.likes || 0;
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

    const toggleLike = async (postId) => {
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
            try {
                // await axios.put(`http://localhost:3000/posts/${postId}/like`);
                await axios.put(`https://insta-post-6t1u.vercel.app/posts/${postId}/like`);
            } catch (error) {
                console.error("Error liking post:", error);
            }
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
            showToast('Image URL copied!', 'success');
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
            window.open(imageUrl, '_blank');
            showToast('Opening image in a new tab...', 'info');
        }
    };

    const handleDelete = async (postId) => {
        if (!window.confirm("Are you sure you want to delete this post?")) return;
        try {
            // await axios.delete(`http://localhost:3000/posts/${postId}`); localhost
            await axios.delete(`https://insta-post-6t1u.vercel.app/posts/${postId}`);
            setPosts(posts.filter(p => p._id !== postId));
            showToast('Post deleted successfully', 'success');
            if (activeLightboxIndex !== null) {
                setActiveLightboxIndex(null);
            }
        } catch (error) {
            console.error(error);
            showToast('Failed to delete post', 'error');
        }
    };

    const processedPosts = posts
        .filter(post => {
            const matchesSearch = post.caption.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesFilter = filterType === 'liked' ? !!likedPosts[post._id] : true;
            const matchesTag = selectedTag ? (post.tags && post.tags.some(tag => tag.toLowerCase() === selectedTag.toLowerCase())) : true;
            return matchesSearch && matchesFilter && matchesTag;
        })
        .sort((a, b) => {
            if (sortBy === 'newest') return b._id.localeCompare(a._id);
            if (sortBy === 'oldest') return a._id.localeCompare(b._id);
            if (sortBy === 'most-liked') {
                return (likeCounts[b._id] || 0) - (likeCounts[a._id] || 0);
            }
            return 0;
        });

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (activeLightboxIndex === null) return;
            if (e.key === 'Escape') setActiveLightboxIndex(null);
            if (e.key === 'ArrowRight') {
                setActiveLightboxIndex(prev => (prev < processedPosts.length - 1 ? prev + 1 : 0));
            }
            if (e.key === 'ArrowLeft') {
                setActiveLightboxIndex(prev => (prev > 0 ? prev - 1 : processedPosts.length - 1));
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [activeLightboxIndex, processedPosts]);

    const openLightbox = (postId) => {
        const index = processedPosts.findIndex(post => post._id === postId);
        if (index !== -1) setActiveLightboxIndex(index);
    };

    const lightboxPost = activeLightboxIndex !== null ? processedPosts[activeLightboxIndex] : null;

    return (
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 transition-colors duration-300">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8 pb-6 border-b border-slate-200/60 dark:border-slate-800/60">
                <div className="animate-slide-up">
                    <div className="flex items-center gap-2.5 mb-1">
                        <Sparkles className="h-5 w-5" style={{ color: 'var(--primary)' }} />
                        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--primary)' }}>Gallery</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                        Feed
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Discover beautiful moments captured by the community
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 animate-slide-up w-full sm:w-auto">
                    <div className="text-xs px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between sm:justify-start gap-2.5 font-semibold text-slate-700 dark:text-slate-300">
                        <span className="h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: posts.length >= 15 ? '#ef4444' : 'var(--primary)' }} />
                        <span>Storage: {posts.length} / 15 slots</span>
                    </div>
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-95 cursor-pointer"
                        style={{ background: 'var(--gradient)' }}
                    >
                        <PlusCircle className="h-4 w-4" />
                        New Post
                    </button>
                </div>
            </div>

            {/* Search + Filters */}
            <div className="glass-card p-3 sm:p-4 rounded-2xl mb-8 animate-slide-up">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search posts..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white/60 dark:bg-slate-900/60 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all text-sm"
                            style={{ '--tw-ring-color': 'var(--primary)' }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                            onBlur={(e) => e.target.style.borderColor = ''}
                        />
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
                            <button
                                onClick={() => setFilterType('all')}
                                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                    filterType === 'all'
                                        ? 'bg-white dark:bg-slate-700 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                                }`}
                                style={filterType === 'all' ? { color: 'var(--primary)' } : {}}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setFilterType('liked')}
                                className={`flex items-center gap-1 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                    filterType === 'liked'
                                        ? 'bg-white dark:bg-slate-700 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                                }`}
                                style={filterType === 'liked' ? { color: 'var(--primary)' } : {}}
                            >
                                <Heart className={`h-3 w-3 ${filterType === 'liked' ? 'fill-current' : ''}`} />
                                Fav
                            </button>
                        </div>

                        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1.5 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
                            <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400" />
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer text-slate-700 dark:text-slate-300"
                            >
                                <option value="newest" className="dark:bg-slate-900">Newest</option>
                                <option value="oldest" className="dark:bg-slate-900">Oldest</option>
                                <option value="most-liked" className="dark:bg-slate-900">Most Liked</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
                            <LayoutGrid className="h-3.5 w-3.5" />
                            <span>{processedPosts.length}</span>
                        </div>
                    </div>
                </div>

                {/* Tag Pills */}
                {allTags.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t border-slate-200/50 dark:border-slate-700/50">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mr-1">Tags:</span>
                        <button
                            onClick={() => setSelectedTag(null)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                !selectedTag
                                    ? 'text-white shadow-sm'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                            }`}
                            style={!selectedTag ? { background: 'var(--gradient)' } : {}}
                        >
                            All
                        </button>
                        {allTags.map(tag => (
                            <button
                                key={tag}
                                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                    selectedTag === tag
                                        ? 'text-white shadow-sm'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                                }`}
                                style={selectedTag === tag ? { background: 'var(--gradient)' } : {}}
                            >
                                #{tag}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Content */}
            {loading ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="rounded-2xl border border-slate-200/60 dark:border-slate-800/80 bg-white/40 dark:bg-slate-900/30 overflow-hidden animate-pulse">
                            <div className="h-64 bg-slate-200 dark:bg-slate-800" />
                            <div className="p-4 space-y-2.5">
                                <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : processedPosts.length > 0 ? (
                <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 items-start">
                    {processedPosts.map((post) => (
                        <article
                            key={post._id}
                            className="group relative flex flex-col rounded-2xl overflow-hidden transition-all duration-300 glass-card card-glass-hover animate-slide-up"
                        >
                            <div 
                                onClick={() => openLightbox(post._id)}
                                className="relative h-64 w-full overflow-hidden bg-slate-100 dark:bg-slate-950 cursor-zoom-in"
                            >
                                <img
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    src={post.image}
                                    alt={post.caption}
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                                <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0" onClick={(e) => e.stopPropagation()}>
                                    <button
                                        onClick={() => handleDownload(post.image, post.caption)}
                                        className="h-8 w-8 flex items-center justify-center bg-white/90 dark:bg-slate-950/80 backdrop-blur text-slate-600 dark:text-slate-300 hover:text-white rounded-lg hover:scale-105 transition-all shadow-md cursor-pointer"
                                        style={{ '--hover-bg': 'var(--gradient)' }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--gradient)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = ''}
                                    >
                                        <Download className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleCopyCaption(post.caption); }}
                                        className="h-8 w-8 flex items-center justify-center bg-white/90 dark:bg-slate-950/80 backdrop-blur text-slate-600 dark:text-slate-300 hover:text-white rounded-lg hover:scale-105 transition-all shadow-md cursor-pointer"
                                        style={{ '--hover-bg': 'var(--gradient)' }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--gradient)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = ''}
                                    >
                                        <Copy className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDelete(post._id); }}
                                        className="h-8 w-8 flex items-center justify-center bg-white/90 dark:bg-slate-950/80 backdrop-blur text-red-500 hover:bg-red-500 hover:text-white rounded-lg hover:scale-105 transition-all shadow-md cursor-pointer ml-1"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </div>

                            <div className="p-4 flex flex-col flex-1">
                                <div className="flex-1">
                                    {post.createdAt && (
                                        <div className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500 mb-1.5 font-medium">
                                            <Clock className="h-3 w-3" />
                                            <span>{timeAgo(post.createdAt)}</span>
                                        </div>
                                    )}
                                    <p className="text-slate-800 dark:text-slate-200 font-medium text-sm leading-relaxed line-clamp-2 first-letter:uppercase">
                                        {post.caption}
                                    </p>
                                    {post.tags && post.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-2.5">
                                            {post.tags.slice(0, 3).map((tag, idx) => (
                                                <span
                                                    key={idx}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedTag(selectedTag === tag ? null : tag);
                                                    }}
                                                    className="text-[10px] font-semibold px-2 py-0.5 rounded-md cursor-pointer transition-all hover:scale-105"
                                                    style={{
                                                        background: 'var(--primary-100)',
                                                        color: 'var(--primary)',
                                                    }}
                                                >
                                                    #{tag}
                                                </span>
                                            ))}
                                            {post.tags.length > 3 && (
                                                <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 px-1">
                                                    +{post.tags.length - 3}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center justify-between pt-3.5 mt-3.5 border-t border-slate-100 dark:border-slate-800/60">
                                    <button
                                        onClick={() => toggleLike(post._id)}
                                        className="flex items-center gap-1.5 text-sm font-semibold transition-all duration-200 cursor-pointer group/like"
                                    >
                                        <Heart
                                            className={`h-4 w-4 transition-all duration-200 ${
                                                likedPosts[post._id] 
                                                    ? 'scale-110' 
                                                    : 'group-hover/like:scale-110'
                                            }`}
                                            style={{
                                                color: likedPosts[post._id] ? 'var(--primary)' : undefined,
                                                fill: likedPosts[post._id] ? 'var(--primary)' : 'none',
                                            }}
                                        />
                                        <span style={{ color: likedPosts[post._id] ? 'var(--primary)' : undefined }}
                                            className={likedPosts[post._id] ? '' : 'text-slate-500 dark:text-slate-400'}
                                        >
                                            {likeCounts[post._id] || 0}
                                        </span>
                                    </button>

                                    <button
                                        onClick={() => handleShare(post)}
                                        className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer transition-colors duration-200"
                                    >
                                        <Share2 className="h-3.5 w-3.5" />
                                        <span className="hidden sm:inline">Share</span>
                                    </button>
                                </div>
                            </div>
                        </article>
                    ))}
                </section>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 px-4 rounded-2xl glass-card text-center animate-slide-up">
                    <div className="h-14 w-14 rounded-xl flex items-center justify-center mb-5 text-white shadow-lg"
                        style={{ background: 'var(--gradient)' }}
                    >
                        <AlertCircle className="h-6 w-6" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                        {searchTerm ? 'No results found' : selectedTag ? `No posts under #${selectedTag}` : 'Gallery is empty'}
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-sm">
                        {searchTerm 
                            ? `No matches for "${searchTerm}". Try another keyword.`
                            : selectedTag
                            ? `No posts tagged with #${selectedTag}.`
                            : filterType === 'liked'
                            ? "You haven't liked any posts yet."
                            : "Be the first to share! Click below to upload."
                        }
                    </p>
                    {filterType === 'liked' ? (
                        <button
                            onClick={() => setFilterType('all')}
                            className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 text-white font-semibold rounded-xl shadow-md transition-all cursor-pointer"
                            style={{ background: 'var(--gradient)' }}
                        >
                            View All Posts
                        </button>
                    ) : (
                        <button
                            onClick={() => navigate('/')}
                            className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 text-white font-semibold rounded-xl shadow-md transition-all cursor-pointer"
                            style={{ background: 'var(--gradient)' }}
                        >
                            Create Your First Post
                        </button>
                    )}
                </div>
            )}

            {/* Lightbox */}
            {lightboxPost && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm transition-opacity duration-300 p-4"
                    onClick={() => setActiveLightboxIndex(null)}
                >
                    <button 
                        onClick={() => setActiveLightboxIndex(null)}
                        className="absolute top-5 right-5 z-50 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur border border-white/10 shadow-xl transition-all cursor-pointer"
                    >
                        <X className="h-5 w-5" />
                    </button>

                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            setActiveLightboxIndex(prev => (prev > 0 ? prev - 1 : processedPosts.length - 1));
                        }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl backdrop-blur border border-white/10 shadow-xl transition-all cursor-pointer z-10"
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </button>

                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            setActiveLightboxIndex(prev => (prev < processedPosts.length - 1 ? prev + 1 : 0));
                        }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl backdrop-blur border border-white/10 shadow-xl transition-all cursor-pointer z-10"
                    >
                        <ChevronRight className="h-6 w-6" />
                    </button>

                    <div 
                        className="relative max-w-5xl w-full max-h-[90vh] bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex-1 bg-slate-100 dark:bg-slate-950 flex items-center justify-center overflow-hidden min-h-[300px] md:min-h-0">
                            <img 
                                src={lightboxPost.image} 
                                alt={lightboxPost.caption} 
                                className="max-w-full max-h-[50vh] md:max-h-[90vh] object-contain"
                            />
                        </div>

                        <div className="w-full md:w-80 p-5 flex flex-col justify-between border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/95">
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-widest"
                                    style={{ color: 'var(--primary)' }}
                                >
                                    Post Details
                                </span>
                                {lightboxPost.createdAt && (
                                    <div className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500 mt-1 font-medium">
                                        <Clock className="h-3 w-3" />
                                        <span>{timeAgo(lightboxPost.createdAt)}</span>
                                    </div>
                                )}
                                <p className="text-slate-800 dark:text-slate-200 text-base leading-relaxed font-medium mt-3 first-letter:uppercase">
                                    {lightboxPost.caption}
                                </p>
                                {lightboxPost.tags && lightboxPost.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mt-4">
                                        {lightboxPost.tags.map((tag, idx) => (
                                            <span
                                                key={idx}
                                                onClick={() => {
                                                    setSelectedTag(tag);
                                                    setActiveLightboxIndex(null);
                                                }}
                                                className="text-[11px] font-semibold px-2 py-0.5 rounded-md cursor-pointer transition-all"
                                                style={{
                                                    background: 'var(--primary-100)',
                                                    color: 'var(--primary)',
                                                }}
                                            >
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800 space-y-4">
                                <button 
                                    onClick={() => toggleLike(lightboxPost._id)}
                                    className="flex items-center gap-2 text-sm font-semibold transition-colors cursor-pointer"
                                >
                                    <Heart 
                                        className={`h-5 w-5 transition-transform ${likedPosts[lightboxPost._id] ? 'scale-110' : ''}`}
                                        style={{
                                            color: likedPosts[lightboxPost._id] ? 'var(--primary)' : undefined,
                                            fill: likedPosts[lightboxPost._id] ? 'var(--primary)' : 'none',
                                        }}
                                    />
                                    <span style={{ color: likedPosts[lightboxPost._id] ? 'var(--primary)' : undefined }}
                                        className={likedPosts[lightboxPost._id] ? '' : 'text-slate-500 dark:text-slate-400'}
                                    >
                                        {likeCounts[lightboxPost._id] || 0} Likes
                                    </span>
                                </button>

                                <div className="grid grid-cols-3 gap-2">
                                    <button 
                                        onClick={() => handleDownload(lightboxPost.image, lightboxPost.caption)}
                                        className="flex flex-col items-center justify-center p-2.5 rounded-xl transition-all cursor-pointer text-white"
                                        style={{ background: 'var(--gradient)' }}
                                    >
                                        <Download className="h-4 w-4 mb-1" />
                                        <span className="text-[10px] font-medium">Download</span>
                                    </button>
                                    <button 
                                        onClick={() => handleCopyCaption(lightboxPost.caption)}
                                        className="flex flex-col items-center justify-center p-2.5 rounded-xl transition-all cursor-pointer text-white"
                                        style={{ background: 'var(--gradient)' }}
                                    >
                                        <Copy className="h-4 w-4 mb-1" />
                                        <span className="text-[10px] font-medium">Copy</span>
                                    </button>
                                    <button 
                                        onClick={() => handleShare(lightboxPost)}
                                        className="flex flex-col items-center justify-center p-2.5 rounded-xl transition-all cursor-pointer text-white"
                                        style={{ background: 'var(--gradient)' }}
                                    >
                                        <Share2 className="h-4 w-4 mb-1" />
                                        <span className="text-[10px] font-medium">Share</span>
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(lightboxPost._id)}
                                        className="flex flex-col items-center justify-center p-2.5 rounded-xl transition-all cursor-pointer bg-red-100 text-red-500 hover:bg-red-500 hover:text-white dark:bg-red-900/30 col-span-3 mt-2"
                                    >
                                        <Trash2 className="h-4 w-4 mb-1" />
                                        <span className="text-[10px] font-medium">Delete Post</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Feed;
const express = require("express");

//it is use to access the image type format like  form-data so that express can't do it because it work with raw data formate
const multer = require("multer");
// it is using the imagekit service to upload the iamge on cloud
const uploadFile = require("./services/storage.service");

const postModel = require("./models.js/post");

//using the cors 

const cors = require("cors");



const app = express();
//using the middleware cors work properly with frontend and backend connection
// Regex that matches any insta-post-* vercel preview/production URL
const vercelPreviewRegex = /^https:\/\/insta-post(-[a-z0-9]+)*\.vercel\.app$/;

const allowedOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
];

if (process.env.FRONTEND_URL) {
    allowedOrigins.push(process.env.FRONTEND_URL);
}
if (process.env.ALLOWED_ORIGINS) {
    const origins = process.env.ALLOWED_ORIGINS.split(",").map(o => o.trim()).filter(Boolean);
    allowedOrigins.push(...origins);
}

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (e.g. curl, mobile apps, Render health checks)
        if (!origin) return callback(null, true);
        // Allow any insta-post-*.vercel.app URL (covers all preview deployments)
        if (vercelPreviewRegex.test(origin)) return callback(null, true);
        // Allow explicitly listed origins
        if (allowedOrigins.includes(origin)) return callback(null, true);
        // Block everything else
        callback(new Error(`CORS: origin '${origin}' not allowed`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"]
}));

// Debug request logging
app.use((req, res, next) => {
    console.log(`>>> Incoming Request: ${req.method} ${req.url} from origin: ${req.headers.origin}`);
    next();
});

app.use(express.json());
//uploading the image in multer in ram
const upload = multer({
    storage:multer.memoryStorage()
});

// Health check / root route — required for Render to confirm the service is alive
app.get("/", (req, res) => {
    res.status(200).json({
        status: "ok",
        message: "InstaPost API is running 🚀",
        version: "1.2.0",
        endpoints: {
            posts: "GET /posts",
            createPost: "POST /create-post",
            likePost: "PUT /posts/:id/like",
            viewPost: "PUT /posts/:id/view",
            bookmarkPost: "PUT /posts/:id/bookmark",
            deletePost: "DELETE /posts/:id",
            limitStatus: "GET /posts/limit-status",
            addComment: "POST /posts/:id/comment",
            deleteComment: "DELETE /posts/:id/comment/:commentId"
        }
    });
});
// to upload it we use the upload.single("key") like we use the image which same as the schema name we use
app.post("/create-post" ,upload.single("image") ,async(req,res)=>{
    try {
        console.log(req.body);
        console.log(req.file);

        if (!req.file) {
            return res.status(400).json({ message: "No image file provided" });
        }
        if (!req.body.caption) {
            return res.status(400).json({ message: "No caption provided" });
        }

        // Check total limit (max 15)
        const totalCount = await postModel.countDocuments();
        if (totalCount >= 15) {
            return res.status(400).json({ 
                message: "Total limit reached. You can only have up to 15 photos. Please delete some photos to add more." 
            });
        }

        // Check daily limit (max 3 in 24 hours)
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const dailyCount = await postModel.countDocuments({
            createdAt: { $gte: twentyFourHoursAgo }
        });
        if (dailyCount >= 3) {
            return res.status(400).json({ 
                message: "Daily limit reached. You can only upload up to 3 photos in a day (24-hour period)." 
            });
        }

        const result = await uploadFile(req.file.buffer);
        
        let tags = [];
        if (req.body.tags) {
            if (typeof req.body.tags === 'string') {
                tags = req.body.tags
                    .split(/[,;]/)
                    .map(tag => tag.trim().replace(/^#/, ""))
                    .filter(tag => tag.length > 0);
            } else if (Array.isArray(req.body.tags)) {
                tags = req.body.tags.map(tag => tag.trim().replace(/^#/, "")).filter(tag => tag.length > 0);
            }
        }

        const post = await postModel.create({
            image:result.url,
            caption:req.body.caption,
            tags:tags
        });

        res.status(201).json({
            message:"Data Successfully Uploaded",
            result:result,
            data:post
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Internal server error during post creation"
        });
    }
});
app.get("/posts/limit-status", async (req, res) => {
    try {
        const totalCount = await postModel.countDocuments();
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const dailyCount = await postModel.countDocuments({
            createdAt: { $gte: twentyFourHoursAgo }
        });

        let nextUploadAvailableAt = null;
        if (dailyCount >= 3) {
            const oldestPostInWindow = await postModel.findOne({
                createdAt: { $gte: twentyFourHoursAgo }
            }).sort({ createdAt: 1 });

            if (oldestPostInWindow) {
                nextUploadAvailableAt = new Date(oldestPostInWindow.createdAt.getTime() + 24 * 60 * 60 * 1000);
            }
        }

        res.status(200).json({
            totalCount,
            totalLimit: 15,
            dailyCount,
            dailyLimit: 3,
            nextUploadAvailableAt
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Internal server error while fetching limit status"
        });
    }
});

app.get("/posts",async(req,res)=>{
    try {
        const post = await postModel.find().sort({ createdAt: -1 });
        res.status(200).json({
            message:"successfully data fetched",
            data:post
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Internal server error during post retrieval"
        });
    }
});

app.put("/posts/:id/like", async(req, res) => {
    try {
        const post = await postModel.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }
        post.likes = (post.likes || 0) + 1;
        await post.save();
        res.status(200).json({ message: "Post liked", data: post });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error during like" });
    }
});

app.delete("/posts/:id", async(req, res) => {
    try {
        const post = await postModel.findByIdAndDelete(req.params.id);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }
        res.status(200).json({ message: "Post deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error during delete" });
    }
});

// ─── Bookmark Toggle ────────────────────────────────────────────────────────
// Increments the global bookmark count (client stores own state in localStorage)
app.put("/posts/:id/bookmark", async (req, res) => {
    try {
        const { action } = req.body; // "add" | "remove"
        const inc = action === "remove" ? -1 : 1;
        const post = await postModel.findByIdAndUpdate(
            req.params.id,
            { $inc: { bookmarks: inc } },
            { new: true }
        );
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }
        res.status(200).json({
            message: action === "remove" ? "Bookmark removed" : "Post bookmarked",
            bookmarks: Math.max(0, post.bookmarks)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error during bookmark" });
    }
});

// ─── View Tracking ──────────────────────────────────────────────────────────
// Increment view count when a post is opened (lightbox opened)
app.put("/posts/:id/view", async (req, res) => {
    try {
        const post = await postModel.findByIdAndUpdate(
            req.params.id,
            { $inc: { views: 1 } },
            { new: true }
        );
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }
        res.status(200).json({ message: "View recorded", views: post.views });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error during view tracking" });
    }
});

// ─── Comments ──────────────────────────────────────────────────────────────
// Add a comment to a post
app.post("/posts/:id/comment", async (req, res) => {
    try {
        const { text, author } = req.body;
        if (!text || !text.trim()) {
            return res.status(400).json({ message: "Comment text is required" });
        }
        const post = await postModel.findById(req.params.id);
        if (!post) return res.status(404).json({ message: "Post not found" });

        post.comments.push({ text: text.trim(), author: (author || "Anonymous").trim() });
        await post.save();
        res.status(201).json({ message: "Comment added", data: post.comments[post.comments.length - 1] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error while adding comment" });
    }
});

// Delete a comment from a post
app.delete("/posts/:id/comment/:commentId", async (req, res) => {
    try {
        const post = await postModel.findById(req.params.id);
        if (!post) return res.status(404).json({ message: "Post not found" });

        const comment = post.comments.id(req.params.commentId);
        if (!comment) return res.status(404).json({ message: "Comment not found" });

        post.comments.pull({ _id: req.params.commentId });
        await post.save();
        res.status(200).json({ message: "Comment deleted" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error while deleting comment" });
    }
});

// Global error handler middleware
app.use((err, req, res, next) => {
    console.error("Unhandled Error:", err);
    res.status(err.status || 500).json({
        message: err.message || "Internal Server Error"
    });
});

module.exports = app;
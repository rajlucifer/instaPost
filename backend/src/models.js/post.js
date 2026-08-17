const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
    text: { type: String, required: true },
    author: { type: String, default: "Anonymous" },
}, { timestamps: true });

const postSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    image: String,
    caption: String,
    tags: { type: [String], default: [] },
    likes: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    bookmarks: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    comments: { type: [commentSchema], default: [] }
}, { timestamps: true });

const postModel = mongoose.model("post", postSchema);

module.exports = postModel;
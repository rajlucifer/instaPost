const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
    text: { type: String, required: true },
    author: { type: String, default: "Anonymous" },
}, { timestamps: true });

const postSchema =  new mongoose.Schema({
    image:String,
    caption:String,
    tags:{ type: [String], default: [] },
    likes: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    bookmarks: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    comments: { type: [commentSchema], default: [] }
}, { timestamps: true });
//here the post is like the collection which store the data which is write in the mongoose.model("post",postSchema);
//we have book name database which have post collection , user collection we have different collection for the database for easy understanding
const postModel = mongoose.model("post",postSchema);

module.exports = postModel;
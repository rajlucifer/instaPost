const mongoose = require("mongoose");

const postSchema =  new mongoose.Schema({
    image:String,
    caption:String,
    tags:{ type: [String], default: [] },
    likes: { type: Number, default: 0 }
}, { timestamps: true });
//here the post is like the collection which store the data which is write in the mongoose.model("post",postSchema);
//we have book name database which have post collection , user collection we have different collection for the database for easy understanding
const postModel = mongoose.model("post",postSchema);

module.exports = postModel;
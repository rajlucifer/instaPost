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
app.use(cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
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

        const result = await uploadFile(req.file.buffer);
        
        const post = await postModel.create({
            image:result.url,
            caption:req.body.caption
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
app.get("/posts",async(req,res)=>{
    try {
        const post = await postModel.find();
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

// Global error handler middleware
app.use((err, req, res, next) => {
    console.error("Unhandled Error:", err);
    res.status(err.status || 500).json({
        message: err.message || "Internal Server Error"
    });
});

module.exports = app;
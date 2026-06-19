const express = require("express");

//it is use to access the image type format like  form-data so that express can't do it because it work with raw data formate
const multer = require("multer");
// it is using the imagekit service to upload the iamge on cloud
const uploadFile = require("../src/services/storage.service");

const postModel = require("../src/models.js/post");

//using the cors 
const cors = require("cors");



const app = express();
//using the middleware cors work properly with frontend and backend connection
app.use(cors());
app.use(express.json());
//uploading the image in multer in ram
const upload = multer({
    storage:multer.memoryStorage()
});
// to upload it we use the upload.single("key") like we use the image which same as the schema name we use
app.post("/create-post" ,upload.single("image") ,async(req,res)=>{
    console.log(req.body);
    // for getting the file data like image we use the req.file 
    console.log(req.file);

    const result = await uploadFile(req.file.buffer);
    

    const post = await postModel.create({
        image:result.url,
        caption:req.body.caption
    });
    res.status(201).json({
        message:"Data Successfully Uploaded"
    })

     
});
app.get("/posts",async(req,res)=>{
    const post = await postModel.find();
    res.status(200).json({
        message:"successfully data fetched",
        data:post
    })

});




module.exports = app;
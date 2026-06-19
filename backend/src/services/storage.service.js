const ImageKit = require("@imagekit/nodejs");

const imageKit = new ImageKit({
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY
});

async function uploadFile(buffer){
    const result = imageKit.files.upload({
        file:buffer.toString("base64"),
        fileName:"filename-1"
    });
    return result;

};
module.exports = uploadFile;

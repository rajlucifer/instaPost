const ImageKit = require("@imagekit/nodejs");

const imageKit = new ImageKit({
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY
});

async function uploadFile(buffer){
    const result = await imageKit.files.upload({
        file:buffer,
        fileName:`post-${Date.now()}`
    });
    return result;

};
module.exports = uploadFile;

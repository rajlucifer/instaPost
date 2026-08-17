const ImageKit = require("@imagekit/nodejs");

const imageKit = new ImageKit({
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY
});

async function uploadFile(buffer, originalName = "photo.jpg") {
    try {
        const base64File = buffer.toString("base64");
        const sanitizeName = originalName.replace(/[^a-zA-Z0-9.-]/g, "_");
        const fileName = `post-${Date.now()}-${sanitizeName}`;

        const result = await imageKit.files.upload({
            file: base64File,
            fileName: fileName
        });

        return result;
    } catch (error) {
        console.error("ImageKit upload error:", error);
        // Fallback to base64 Data URI if ImageKit service is unreachable or fails
        const mimeType = "image/jpeg";
        const base64String = buffer.toString("base64");
        return {
            url: `data:${mimeType};base64,${base64String}`
        };
    }
}

module.exports = uploadFile;

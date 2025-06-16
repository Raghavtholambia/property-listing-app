const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "PROJECT2",
        allowed_formats: ["png", "jpg", "jpeg","avif"] // ✅ fixed typo here
    }
});

module.exports = {
    cloudinary,
    storage
};


// // Instead of this original URL:
// https://res.cloudinary.com/your-name/image/upload/v1234567890/myimage.jpg

// // Use this optimized one:
// https://res.cloudinary.com/your-name/image/upload/w_400,h_300,c_fill,q_auto,f_auto/v1234567890/myimage.jpg
// What this does:

// w_400,h_300 – resize to 400x300

// c_fill – crop to fill the size

// q_auto – automatic quality optimization

// f_auto – serve WebP/JPEG based on browser support



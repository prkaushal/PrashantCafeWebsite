const cloudinary = require('cloudinary').v2;
require('dotenv').config(); // Ensure you have dotenv installed to load environment variables

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Test upload function
const testUpload = async () => {
  try {
    const result = await cloudinary.uploader.upload('frontend\public\chai.webp', {
      folder: 'test_folder'
    });
    console.log('Upload successful:', result.secure_url);
  } catch (error) {
    console.error('Upload error:', error);
  }
};

testUpload();
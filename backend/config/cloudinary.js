import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import dotenv from 'dotenv';

dotenv.config();

// Detailed Logging for Debugging (Masked for safety)
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

console.log('--- Cloudinary Config Initialization ---');
console.log('Cloud Name:', cloudName ? 'Present' : 'MISSING');
console.log('API Key:', apiKey ? 'Present' : 'MISSING');
console.log('API Secret:', apiSecret ? 'Present' : 'MISSING');

if (!cloudName || !apiKey || !apiSecret) {
  console.error('CRITICAL ERROR: Cloudinary environment variables are missing! Please check your Render/env settings.');
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'anokhi-products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'avif'],
  },
});

const upload = multer({ storage: storage });

export default upload;
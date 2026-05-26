import { v2 as cloudinary } from "cloudinary";
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const testUpload = async () => {
  try {
    console.log('Testing Cloudinary upload with config:', {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
    });
    
    // Upload a small base64 transparent pixel
    const result = await cloudinary.uploader.upload('data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', {
      folder: 'test-folder'
    });
    
    console.log('[SUCCESS] Cloudinary upload works perfectly!');
    console.log('Uploaded URL:', result.secure_url);
    process.exit(0);
  } catch (error) {
    console.error('[FAILED] Cloudinary upload failed:', error);
    process.exit(1);
  }
};

testUpload();

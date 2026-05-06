import express from 'express';
import upload from '../config/cloudinary.js';

const router = express.Router();

// Diagnostic route to check config
router.get('/test-config', (req, res) => {
  res.json({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? 'Present' : 'MISSING',
    api_key: process.env.CLOUDINARY_API_KEY ? 'Present' : 'MISSING',
    api_secret: process.env.CLOUDINARY_API_SECRET ? 'Present' : 'MISSING',
    env_count: Object.keys(process.env).length,
    node_version: process.version
  });
});

// Route for multiple images upload to Cloudinary
router.post('/', (req, res, next) => {
  console.log('--- Upload Request Received ---');
  console.log('Cloudinary Config Status:', {
    name: !!process.env.CLOUDINARY_CLOUD_NAME,
    key: !!process.env.CLOUDINARY_API_KEY,
    secret: !!process.env.CLOUDINARY_API_SECRET
  });

  upload.array('images', 10)(req, res, (err) => {
    if (err) {
      console.error('Multer/Cloudinary Error:', err.message);
      return res.status(400).json({ message: err.message });
    }
    
    if (req.files) {
      const paths = req.files.map(file => file.path);
      res.send(paths);
    } else {
      res.status(400).send('No images were uploaded');
    }
  });
});

export default router;

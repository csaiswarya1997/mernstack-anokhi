import express from 'express';
import upload from '../config/cloudinary.js';

const router = express.Router();

// Route for multiple images upload to Cloudinary
router.post('/', upload.array('images', 10), (req, res) => {
  if (req.files) {
    // Cloudinary returns the full URL in file.path or file.secure_url
    const paths = req.files.map(file => file.path);
    res.send(paths);
  } else {
    res.status(400).send('No images were uploaded');
  }
});

export default router;

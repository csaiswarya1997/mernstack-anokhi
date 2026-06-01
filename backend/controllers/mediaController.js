import Media from '../models/Media.js';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// @desc    Get all media assets
// @route   GET /api/media
// @access  Private/Admin
export const getMedia = async (req, res) => {
  try {
    const media = await Media.find({}).sort({ createdAt: -1 });
    res.json(media);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving media items', error: error.message });
  }
};

// @desc    Upload brand media asset
// @route   POST /api/media
// @access  Private/Admin
export const uploadMedia = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file was uploaded' });
    }

    const { name, category } = req.body;
    if (!category) {
      return res.status(400).json({ message: 'Category is required' });
    }

    const finalName = name || req.file.originalname.split('.')[0] || 'Brand Asset';

    const mediaItem = await Media.create({
      name: finalName,
      url: req.file.path,
      publicId: req.file.filename,
      category: category,
    });

    res.status(201).json(mediaItem);
  } catch (error) {
    res.status(500).json({ message: 'Error saving media item', error: error.message });
  }
};

// @desc    Delete media asset
// @route   DELETE /api/media/:id
// @access  Private/Admin
export const deleteMedia = async (req, res) => {
  try {
    const mediaItem = await Media.findById(req.params.id);

    if (!mediaItem) {
      return res.status(404).json({ message: 'Media item not found' });
    }

    // Securely delete from Cloudinary storage
    if (mediaItem.publicId) {
      try {
        await cloudinary.uploader.destroy(mediaItem.publicId);
        console.log(`Cloudinary file destroyed successfully: ${mediaItem.publicId}`);
      } catch (cloudErr) {
        console.error('Cloudinary Deletion Error:', cloudErr.message);
        // Continue database deletion even if Cloudinary fails, so DB doesn't get out of sync
      }
    }

    await mediaItem.deleteOne();
    res.json({ message: 'Media item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting media item', error: error.message });
  }
};

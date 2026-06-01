import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import upload from '../config/cloudinary.js';
import {
  getMedia,
  uploadMedia,
  deleteMedia,
} from '../controllers/mediaController.js';

const router = express.Router();

// Apply protect and admin middleware globally to all media routes
router.use(protect);
router.use(admin);

router.route('/')
  .get(getMedia)
  .post(upload.single('file'), uploadMedia);

router.route('/:id')
  .delete(deleteMedia);

export default router;

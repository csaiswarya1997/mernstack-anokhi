import express from 'express';
import { submitEnquiry, getEnquiries, updateEnquiryStatus } from '../controllers/contactController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(submitEnquiry)
  .get(protect, admin, getEnquiries);

router.route('/:id')
  .put(protect, admin, updateEnquiryStatus);

export default router;

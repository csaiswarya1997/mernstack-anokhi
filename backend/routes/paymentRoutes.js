import express from 'express';
import { createRazorpayOrder, verifyPayment, getRazorpayKey } from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/key', getRazorpayKey);
router.post('/order', protect, createRazorpayOrder);
router.post('/verify', protect, verifyPayment);

export default router;

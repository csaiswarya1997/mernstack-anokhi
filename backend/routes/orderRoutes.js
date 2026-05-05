import express from 'express';
import orderController from '../controllers/orderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, orderController.createOrder).get(protect, admin, orderController.getOrders);
router.route('/myorders').get(protect, orderController.getMyOrders);
router.route('/:id/status').put(protect, admin, orderController.updateOrderStatus);

export default router;

import express from 'express';
import productController from '../controllers/productController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import {
  createRequest,
  getRequests,
  updateStatus,
  deleteRequest
} from '../controllers/restockController.js';

const router = express.Router();

router.route('/')
  .get(productController.getProducts)
  .post(productController.createProduct);

// Place admin-specific routes BEFORE parameter routes to prevent Express :id collisions
router.route('/admin/restock-notifications')
  .get(protect, admin, getRequests);

router.route('/admin/restock-notifications/:id/status')
  .put(protect, admin, updateStatus);

router.route('/admin/restock-notifications/:id')
  .delete(protect, admin, deleteRequest);

router.route('/:id')
  .get(productController.getProductById)
  .put(productController.updateProduct)
  .delete(productController.deleteProduct);

router.route('/:id/reviews')
  .post(productController.createProductReview);

router.route('/:id/reviews/:reviewId')
  .delete(productController.deleteProductReview);

router.route('/:id/restock-notification')
  .post(createRequest);

export default router;


import express from 'express';
import productController from '../controllers/productController.js';

const router = express.Router();

router.route('/')
  .get(productController.getProducts)
  .post(productController.createProduct);
router.route('/:id')
  .get(productController.getProductById)
  .put(productController.updateProduct)
  .delete(productController.deleteProduct);
router.route('/:id/reviews')
  .post(productController.createProductReview);
router.route('/:id/reviews/:reviewId')
  .delete(productController.deleteProductReview);

export default router;

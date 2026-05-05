import express from 'express';
import {
  createBespokeRequest,
  getBespokeRequests,
  updateBespokeStatus,
  getMyBespokeRequests,
  getBespokeById,
  updateBespokeRequest
} from '../controllers/bespokeController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(createBespokeRequest)
  .get(protect, admin, getBespokeRequests);

router.route('/myrequests')
  .get(protect, getMyBespokeRequests);

router.route('/:id')
  .get(protect, getBespokeById)
  .put(protect, updateBespokeRequest);

router.route('/:id/status')
  .put(protect, admin, updateBespokeStatus);

export default router;

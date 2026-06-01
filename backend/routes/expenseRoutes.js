import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import { 
  getExpenses, 
  createExpense, 
  deleteExpense 
} from '../controllers/expenseController.js';

const router = express.Router();

// Apply protect and admin middleware globally to all expense routes
router.use(protect);
router.use(admin);

router.route('/')
  .get(getExpenses)
  .post(createExpense);

router.route('/:id')
  .delete(deleteExpense);

export default router;

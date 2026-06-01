import Expense from '../models/Expense.js';

// @desc    Get all operational expenses
// @route   GET /api/expenses
// @access  Private (Admin only)
export const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({}).sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    console.error('[EXPENSE CONTROLLER GET ERROR]:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Record a new operational expense
// @route   POST /api/expenses
// @access  Private (Admin only)
export const createExpense = async (req, res) => {
  try {
    const { amount, category, description, date } = req.body;

    if (!amount || !category) {
      return res.status(400).json({ message: 'Please provide both amount and category.' });
    }

    const expense = new Expense({
      amount: Number(amount),
      category,
      description: description || '',
      date: date ? new Date(date) : new Date(),
    });

    const createdExpense = await expense.save();
    res.status(201).json(createdExpense);
  } catch (error) {
    console.error('[EXPENSE CONTROLLER POST ERROR]:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Delete an operational expense
// @route   DELETE /api/expenses/:id
// @access  Private (Admin only)
export const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: 'Expense record not found.' });
    }

    await expense.deleteOne();
    res.json({ message: 'Expense record removed successfully.' });
  } catch (error) {
    console.error('[EXPENSE CONTROLLER DELETE ERROR]:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

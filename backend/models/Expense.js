import mongoose from 'mongoose';

const expenseSchema = mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['Packaging', 'Courier', 'Operations', 'Other'],
    },
    description: {
      type: String,
      default: '',
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Expense = mongoose.model('Expense', expenseSchema);

export default Expense;

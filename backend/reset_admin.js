import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import connectDB from './config/db.js';

dotenv.config();

const resetPassword = async () => {
  try {
    await connectDB();
    const user = await User.findOne({ email: 'aiswaryadas@yopmail.com' });
    if (user) {
      user.password = 'admin123';
      await user.save();
      console.log('Password reset successfully for aiswaryadas@yopmail.com');
    } else {
      console.log('User not found');
    }
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

resetPassword();

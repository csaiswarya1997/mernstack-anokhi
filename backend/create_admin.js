import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import connectDB from './config/db.js';

dotenv.config();

const createAdmin = async () => {
  try {
    await connectDB();
    
    const email = 'csaiswarya29@gmail.com';
    const password = 'admin123';
    
    let user = await User.findOne({ email });
    
    if (user) {
      user.password = password;
      user.isAdmin = true;
      await user.save();
      console.log(`[SUCCESS] Existing user ${email} updated to Admin with password ${password}`);
    } else {
      user = await User.create({
        name: 'Admin',
        email,
        password,
        isAdmin: true
      });
      console.log(`[SUCCESS] New Admin user created with email ${email} and password ${password}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('[ERROR] Failed to create Admin user:', error);
    process.exit(1);
  }
};

createAdmin();

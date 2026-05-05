import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import connectDB from './config/db.js';

dotenv.config();

const listUsers = async () => {
  try {
    await connectDB();
    const users = await User.find({});
    console.log('--- USERS ---');
    users.forEach(u => {
      console.log(`Name: ${u.name}, Email: ${u.email}, isAdmin: ${u.isAdmin}`);
    });
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

listUsers();

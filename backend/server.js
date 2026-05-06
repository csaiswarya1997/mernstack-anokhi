import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import connectDB from './config/db.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import bespokeRoutes from './routes/bespokeRoutes.js';
import userRoutes from './routes/userRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import User from './models/User.js';

dotenv.config();

if (process.env.MONGO_URI) {
  connectDB();
} else {
  console.log('No MONGO_URI provided, skipping DB connection for now.');
}

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Anokhi API is running...');
});

// Temporary Admin Setup Route
app.get('/api/setup-admin-anokhi', async (req, res) => {
  try {
    const email = 'aiswaryadas@yopmail.com';
    const user = await User.findOne({ email });
    
    if (user) {
      user.password = 'admin123';
      user.isAdmin = true;
      await user.save();
      res.send('Admin account updated successfully! Use: aiswaryadas@yopmail.com / admin123');
    } else {
      await User.create({
        name: 'Admin User',
        email: email,
        password: 'admin123',
        isAdmin: true
      });
      res.send('Admin account created successfully! Use: aiswaryadas@yopmail.com / admin123');
    }
  } catch (error) {
    res.status(500).send('Error: ' + error.message);
  }
});

app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/bespoke', bespokeRoutes);
app.use('/api/users', userRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/settings', settingsRoutes);

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Global Error Handler
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  console.error('Error Stack:', err.stack);
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

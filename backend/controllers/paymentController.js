import Razorpay from 'razorpay';
import crypto from 'crypto';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

// @desc    Create Razorpay order
// @route   POST /api/payment/order
// @access  Private
export const createRazorpayOrder = async (req, res) => {
  try {
    const { amount, cartItems } = req.body;

    console.log(`[PAYMENT] Creating order for amount: ${amount} INR`);
    
    // Verify & Reserve stock availability immediately in DB to lock it during the checkout payment phase
    if (cartItems && Array.isArray(cartItems)) {
      for (const item of cartItems) {
        const product = await Product.findById(item._id || item.id);
        if (!product) {
          return res.status(404).json({ message: `Product not found: ${item.name || 'Unknown'}` });
        }
        
        const availableStock = product.stockBySize?.[item.size] || 0;
        if (availableStock < item.quantity) {
          return res.status(400).json({ 
            message: `Insufficient stock: only ${availableStock} left for ${product.name} in size ${item.size}. Please adjust your bag.` 
          });
        }

        // Lock (Reserve) the stock in the database
        product.stockBySize[item.size] -= item.quantity;
        product.countInStock = Object.values(product.stockBySize).reduce((sum, val) => sum + val, 0);
        await product.save();
      }
    }
    
    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error('[PAYMENT ERROR] Razorpay keys are missing in .env');
      return res.status(500).json({ message: 'Payment gateway configuration missing.' });
    }

    const options = {
      amount: Math.round(amount * 100), // amount in smallest currency unit (paise)
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    };

    const order = await instance.orders.create(options);
    console.log(`[PAYMENT SUCCESS] Razorpay Order Created: ${order.id}`);
    res.json(order);
  } catch (error) {
    console.error('[PAYMENT ERROR] Razorpay order creation failed:', error);
    res.status(500).json({ message: 'Razorpay order creation failed', error: error.message });
  }
};

// @desc    Verify Razorpay payment
// @route   POST /api/payment/verify
// @access  Private
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret')
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      return res.status(200).json({ message: "Payment verified successfully" });
    } else {
      return res.status(400).json({ message: "Invalid signature sent!" });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get Razorpay Key ID
// @route   GET /api/payment/key
// @access  Public
export const getRazorpayKey = async (req, res) => {
  try {
    if (!process.env.RAZORPAY_KEY_ID) {
      return res.status(404).json({ message: 'Razorpay key ID is not configured.' });
    }
    res.json({ keyId: process.env.RAZORPAY_KEY_ID });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Release reserved stock if payment fails / popup is closed
// @route   POST /api/payment/release
// @access  Private
export const releaseStock = async (req, res) => {
  try {
    const { cartItems } = req.body;
    
    console.log('[PAYMENT] Releasing stock for items due to payment cancellation/dismissal');

    if (cartItems && Array.isArray(cartItems)) {
      for (const item of cartItems) {
        const product = await Product.findById(item._id || item.id);
        if (product && product.stockBySize) {
          product.stockBySize[item.size] += Number(item.quantity || 1);
          product.countInStock = Object.values(product.stockBySize).reduce((sum, val) => sum + val, 0);
          await product.save();
        }
      }
    }
    res.json({ message: 'Stock released successfully' });
  } catch (error) {
    console.error('[STOCK RELEASE ERROR]:', error);
    res.status(500).json({ message: 'Failed to release stock', error: error.message });
  }
};


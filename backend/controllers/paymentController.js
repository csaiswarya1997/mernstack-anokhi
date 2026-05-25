import Razorpay from 'razorpay';
import crypto from 'crypto';
import Order from '../models/Order.js';

// @desc    Create Razorpay order
// @route   POST /api/payment/order
// @access  Private
export const createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    console.log(`[PAYMENT] Creating order for amount: ${amount} INR`);
    
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

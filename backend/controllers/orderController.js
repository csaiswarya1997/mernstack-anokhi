import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { sendOrderEmail, sendOrderSMS, sendOrderWhatsApp, sendShippingEmail } from '../utils/notificationService.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Public (for now)
const createOrder = async (req, res) => {
  try {
    const { orderItems, shippingInfo, totalPrice } = req.body;

    if (orderItems && orderItems.length === 0) {
      res.status(400).json({ message: 'No order items' });
      return;
    }

    const isAlreadyReserved = req.body.isPaid || !!req.body.paymentResult;

    // Verify stock availability for all items before saving the order
    // (Only check if stock wasn't already reserved/deducted during the payment order phase)
    if (!isAlreadyReserved) {
      for (const item of orderItems) {
        const product = await Product.findById(item.product);
        if (!product) {
          res.status(404).json({ message: `Product not found: ${item.name || 'Unknown'}` });
          return;
        }
        
        const availableStock = product.stockBySize?.[item.size] || 0;
        if (availableStock < item.quantity) {
          res.status(400).json({ 
            message: `Insufficient stock: only ${availableStock} left for ${product.name} in size ${item.size}.` 
          });
          return;
        }
      }
    }

    const order = new Order({
      user: req.user._id,
      orderItems,
      shippingInfo,
      totalPrice,
      paymentResult: req.body.paymentResult,
      isPaid: req.body.isPaid || false,
      status: 'Processing',
    });

    const createdOrder = await order.save();

    // Reduce Stock only if it was not already reserved during the payment order phase (i.e. Cash on Delivery or unpaid order)
    if (!createdOrder.isPaid) {
      for (const item of orderItems) {
        const product = await Product.findById(item.product);
        if (product && product.stockBySize && product.stockBySize[item.size] !== undefined) {
          product.stockBySize[item.size] -= item.quantity;
          if (product.stockBySize[item.size] < 0) product.stockBySize[item.size] = 0;
          
          // Recalculate total countInStock
          product.countInStock = Object.values(product.stockBySize).reduce((sum, val) => sum + val, 0);
          
          await product.save();
        }
      }
    }

    // Trigger Notifications (Email, SMS & WhatsApp)
    // We don't await these so they don't block the response, but they will fire immediately
    sendOrderEmail(createdOrder);
    sendOrderSMS(createdOrder);
    sendOrderWhatsApp(createdOrder);

    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Public (Admin)
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Public (Admin)
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (order) {
      const oldStatus = order.status;
      order.status = status;
      const updatedOrder = await order.save();

      // Trigger Shipping Confirmation Email if status changes to Shipped
      if (status === 'Shipped' && oldStatus !== 'Shipped') {
        sendShippingEmail(updatedOrder);
      }

      // Handle Stock restoration/reduction on status change
      if (status === 'Cancelled' && oldStatus !== 'Cancelled') {
        // Restore stock
        for (const item of order.orderItems) {
          const product = await Product.findById(item.product);
          if (product && product.stockBySize && product.stockBySize[item.size] !== undefined) {
            product.stockBySize[item.size] += item.quantity;
            product.countInStock = Object.values(product.stockBySize).reduce((sum, val) => sum + val, 0);
            await product.save();
          }
        }
      } else if (oldStatus === 'Cancelled' && status !== 'Cancelled') {
        // Re-reduce stock if un-cancelled
        for (const item of order.orderItems) {
          const product = await Product.findById(item.product);
          if (product && product.stockBySize && product.stockBySize[item.size] !== undefined) {
            product.stockBySize[item.size] -= item.quantity;
            if (product.stockBySize[item.size] < 0) product.stockBySize[item.size] = 0;
            product.countInStock = Object.values(product.stockBySize).reduce((sum, val) => sum + val, 0);
            await product.save();
          }
        }
      }

      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export default { createOrder, getOrders, updateOrderStatus, getMyOrders };

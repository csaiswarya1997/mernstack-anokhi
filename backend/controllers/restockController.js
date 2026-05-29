import Product from '../models/Product.js';
import RestockNotification from '../models/RestockNotification.js';
import { sendRestockEmail } from '../utils/notificationService.js';

// @desc    Create a new restock notification request
// @route   POST /api/products/:id/restock-notification
// @access  Public
export const createRequest = async (req, res) => {
  try {
    const { name, email, phone, size } = req.body;
    const productId = req.params.id;

    if (!name || !email || !size) {
      return res.status(400).json({ message: 'Please provide name, email, and size.' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    // Email format validation helper
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address.' });
    }

    // Check if the user is already on the waitlist for this specific product and size
    const existingRequest = await RestockNotification.findOne({
      product: productId,
      size,
      email: email.toLowerCase(),
      status: 'Pending'
    });

    if (existingRequest) {
      return res.status(400).json({
        message: `You are already on the waitlist for ${product.name} in size ${size}! We will let you know as soon as it is restocked.`
      });
    }

    // Create the restock request
    const notification = await RestockNotification.create({
      product: productId,
      productName: product.name,
      productCode: product.productCode || 'REF-ZALOURA',
      size,
      name,
      email: email.toLowerCase(),
      phone: phone || ''
    });

    res.status(201).json({
      message: 'Success! You have been added to the waitlist. We will notify you once this item is restocked.',
      notification
    });
  } catch (error) {
    console.error('[RESTOCK CONTROLLER ERROR]:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get all restock notification requests
// @route   GET /api/products/admin/restock-notifications
// @access  Private (Admin only)
export const getRequests = async (req, res) => {
  try {
    const requests = await RestockNotification.find({})
      .populate('product', 'name image price stockBySize countInStock')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    console.error('[RESTOCK CONTROLLER ERROR]:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update a restock notification request status
// @route   PUT /api/products/admin/restock-notifications/:id/status
// @access  Private (Admin only)
export const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status || !['Pending', 'Notified'].includes(status)) {
      return res.status(400).json({ message: 'Please provide a valid status (Pending or Notified).' });
    }

    const request = await RestockNotification.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Restock notification request not found.' });
    }

    const previousStatus = request.status;
    request.status = status;
    const updatedRequest = await request.save();

    // Trigger Restock Notification Email if status changes to Notified
    if (status === 'Notified' && previousStatus !== 'Notified') {
      // Fire and forget email dispatch in background
      sendRestockEmail(updatedRequest, req.headers.origin);
    }

    res.json(updatedRequest);
  } catch (error) {
    console.error('[RESTOCK CONTROLLER ERROR]:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Delete a restock notification request
// @route   DELETE /api/products/admin/restock-notifications/:id
// @access  Private (Admin only)
export const deleteRequest = async (req, res) => {
  try {
    const request = await RestockNotification.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Restock notification request not found.' });
    }

    await request.deleteOne();
    res.json({ message: 'Restock notification request removed successfully.' });
  } catch (error) {
    console.error('[RESTOCK CONTROLLER ERROR]:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

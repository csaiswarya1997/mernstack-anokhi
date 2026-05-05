import asyncHandler from 'express-async-handler';
import Contact from '../models/Contact.js';

// @desc    Submit a contact enquiry
// @route   POST /api/contact
// @access  Public
const submitEnquiry = asyncHandler(async (req, res) => {
  const { name, email, phone, comment } = req.body;
  const enquiry = await Contact.create({ name, email, phone, comment });
  if (enquiry) {
    res.status(201).json(enquiry);
  } else {
    res.status(400);
    throw new Error('Invalid enquiry data');
  }
});

// @desc    Get all enquiries
// @route   GET /api/contact
// @access  Private/Admin
const getEnquiries = asyncHandler(async (req, res) => {
  const enquiries = await Contact.find({}).sort({ createdAt: -1 });
  res.json(enquiries);
});

// @desc    Update enquiry status
// @route   PUT /api/contact/:id
// @access  Private/Admin
const updateEnquiryStatus = asyncHandler(async (req, res) => {
  const enquiry = await Contact.findById(req.params.id);
  if (enquiry) {
    enquiry.status = req.body.status || enquiry.status;
    const updatedEnquiry = await enquiry.save();
    res.json(updatedEnquiry);
  } else {
    res.status(404);
    throw new Error('Enquiry not found');
  }
});

export { submitEnquiry, getEnquiries, updateEnquiryStatus };

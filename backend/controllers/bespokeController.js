import Bespoke from '../models/Bespoke.js';

// @desc    Create new bespoke request
// @route   POST /api/bespoke
// @access  Public
const createBespokeRequest = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, whatsapp, requirement, images, user } = req.body;
    const bespoke = new Bespoke({
      user,
      firstName,
      lastName,
      email,
      phone,
      whatsapp,
      requirement,
      images
    });
    const createdRequest = await bespoke.save();
    res.status(201).json(createdRequest);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get all bespoke requests
// @route   GET /api/bespoke
// @access  Public (Admin)
const getBespokeRequests = async (req, res) => {
  try {
    const requests = await Bespoke.find({}).sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update bespoke request status
// @route   PUT /api/bespoke/:id/status
// @access  Public (Admin)
const updateBespokeStatus = async (req, res) => {
  try {
    const request = await Bespoke.findById(req.params.id);
    if (request) {
      request.status = req.body.status || request.status;
      if (req.body.contactStatus) {
        request.contactStatus = req.body.contactStatus;
      }
      if (req.body.adminNotes !== undefined) {
        request.adminNotes = req.body.adminNotes;
      }
      const updatedRequest = await request.save();
      res.json(updatedRequest);
    } else {
      res.status(404).json({ message: 'Request not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get logged in user bespoke requests
// @route   GET /api/bespoke/myrequests
// @access  Private
const getMyBespokeRequests = async (req, res) => {
  try {
    const requests = await Bespoke.find({
      $or: [
        { user: req.user._id },
        { email: req.user.email }
      ]
    }).sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get bespoke request by ID
// @route   GET /api/bespoke/:id
// @access  Private
const getBespokeById = async (req, res) => {
  try {
    const request = await Bespoke.findById(req.params.id);
    if (request) {
      // Check if user is admin or the owner
      if (req.user.isAdmin || request.user?.toString() === req.user._id.toString() || request.email === req.user.email) {
        res.json(request);
      } else {
        res.status(401).json({ message: 'Not authorized' });
      }
    } else {
      res.status(404).json({ message: 'Request not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update bespoke request by user
// @route   PUT /api/bespoke/:id
// @access  Private
const updateBespokeRequest = async (req, res) => {
  try {
    const request = await Bespoke.findById(req.params.id);
    if (request) {
      // Check authorization (Owner or admin)
      if (!req.user.isAdmin && request.user?.toString() !== req.user._id.toString() && request.email !== req.user.email) {
        return res.status(401).json({ message: 'Not authorized' });
      }

      // Check status - only allow edit if 'New'
      if (request.status !== 'New') {
        return res.status(400).json({ message: 'Cannot edit request once it has been processed' });
      }

      const { firstName, lastName, email, phone, whatsapp, requirement, images } = req.body;
      request.firstName = firstName || request.firstName;
      request.lastName = lastName || request.lastName;
      request.email = email || request.email;
      request.phone = phone || request.phone;
      request.whatsapp = whatsapp || request.whatsapp;
      request.requirement = requirement || request.requirement;
      request.images = images || request.images;

      const updatedRequest = await request.save();
      res.json(updatedRequest);
    } else {
      res.status(404).json({ message: 'Request not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export { createBespokeRequest, getBespokeRequests, updateBespokeStatus, getMyBespokeRequests, getBespokeById, updateBespokeRequest };

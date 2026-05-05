import asyncHandler from 'express-async-handler';
import Settings from '../models/Settings.js';

// @desc    Get store settings
// @route   GET /api/settings
// @access  Public
const getSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne();
  if (!settings) {
    // Create default settings if none exist
    settings = await Settings.create({
      address: '123, Heritage Lane, Boutique District, Jaipur, Rajasthan 302001',
      phone: '+91 98765 43210',
      email: 'concierge@anokhi.com',
      whatsapp: '+91 98765 43210',
      instagram: '@maison_anokhi',
      workingHours: '10 AM — 7 PM'
    });
  }
  res.json(settings);
});

// @desc    Update store settings
// @route   PUT /api/settings
// @access  Private/Admin
const updateSettings = asyncHandler(async (req, res) => {
  const { address, phone, email, whatsapp, instagram, workingHours, shippingPolicy, returnsPolicy, internationalPolicy, qualityPolicy } = req.body;
  
  let settings = await Settings.findOne();
  
  if (settings) {
    settings.address = address || settings.address;
    settings.phone = phone || settings.phone;
    settings.email = email || settings.email;
    settings.whatsapp = whatsapp || settings.whatsapp;
    settings.instagram = instagram || settings.instagram;
    settings.workingHours = workingHours || settings.workingHours;
    settings.shippingPolicy = shippingPolicy !== undefined ? shippingPolicy : settings.shippingPolicy;
    settings.returnsPolicy = returnsPolicy !== undefined ? returnsPolicy : settings.returnsPolicy;
    settings.internationalPolicy = internationalPolicy !== undefined ? internationalPolicy : settings.internationalPolicy;
    settings.qualityPolicy = qualityPolicy !== undefined ? qualityPolicy : settings.qualityPolicy;
    
    const updatedSettings = await settings.save();
    res.json(updatedSettings);
  } else {
    const newSettings = await Settings.create({
      address, phone, email, whatsapp, instagram, workingHours, shippingPolicy, returnsPolicy, internationalPolicy, qualityPolicy
    });
    res.status(201).json(newSettings);
  }
});

export { getSettings, updateSettings };

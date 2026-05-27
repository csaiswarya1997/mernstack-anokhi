import asyncHandler from 'express-async-handler';
import Settings from '../models/Settings.js';

// @desc    Get store settings
// @route   GET /api/settings
// @access  Public
const getSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne();
  
  const defaultShippingPolicy = `Safe Dispatch: At Zaloura, we carefully inspect and pack every product before dispatch to make sure it reaches you safely.
Processing Timeline: Orders are usually processed within 1–3 business days after order confirmation.
Estimated Delivery: Once the order is processed and shipped, the estimated delivery time is 7–15 working days, depending on your location and courier service availability.
Delivery Variations: Delivery time may vary due to public holidays, weather conditions, courier delays, or other unavoidable situations.
Status Tracking: Customers will receive order and shipping updates through WhatsApp, SMS, email, or website order tracking where available.
Delivery Accuracy: Please make sure your delivery address and phone number are correct before placing the order. Zaloura will not be responsible for delays or failed delivery caused by incorrect address, unavailable customer, or courier issues.`;

  const defaultReturnsPolicy = `Selective Policy: Zaloura follows a No Return, No COD, and Limited Exchange Policy.
Strict Return Rules: We do not accept returns once the product is delivered. Cash on Delivery is not available. All orders must be prepaid.
Exchange Conditions: Exchange is possible only if the product received is damaged, defective, or incorrect; the customer provides a clear, unedited, and original unboxing video; the issue is reported within 24 hours of delivery; the product is unused, unwashed, and in its original condition; and tags, packaging, and invoice are available.
Unboxing Verification: Exchange requests without a proper unboxing video will not be accepted. The unboxing video must clearly show the sealed package being opened, the product condition, and any issue found. Edited, paused, cut, or unclear videos will not be considered valid proof.
Exchange Exclusions: Exchange will not be accepted for size issues, color variation due to lighting/screen difference, change of mind, wrong address, or personal preference.`;

  const defaultInternationalPolicy = `Global Shipping Restriction: Currently, Zaloura does not provide international delivery directly through the website.
WhatsApp Concierge Support: If any customer requires international delivery, they can contact us through WhatsApp before placing the order. Our team will check the product, location, shipping availability, delivery time, and charges, then confirm whether international delivery is possible.
Duties & Additional Fees: International shipping charges, customs duty, import taxes, or any additional charges from the destination country must be paid by the customer.
Varying Transit Speeds: International delivery time may vary depending on the country, customs clearance, and courier service availability.`;

  const defaultQualityPolicy = `Inspection Standards: At Zaloura, we make sure every product is checked before packing and dispatch.
Rigorous Inspection: Before delivery, we inspect the product for quality, damage, stitching/finishing, product condition, correct item & quantity, and packing safety.
Quality Commitment: We assure that only checked and approved products are packed and delivered to customers.
Slight Variations: Slight color differences may occur due to lighting, photography, or screen display settings. These are not considered product defects.
Our Ultimate Goal: Our goal is to deliver good-quality products with proper checking and safe packaging.`;

  if (!settings) {
    // Create default settings if none exist
    settings = await Settings.create({
      address: '123, Heritage Lane, Boutique District, Thrissur, Kerala 680007',
      phone: '+91 89212 73858',
      email: 'zaloura.in@gmail.com',
      whatsapp: '+91 89212 73858',
      instagram: '@zaloura.in_',
      workingHours: '10 AM — 7 PM',
      shippingPolicy: defaultShippingPolicy,
      returnsPolicy: defaultReturnsPolicy,
      internationalPolicy: defaultInternationalPolicy,
      qualityPolicy: defaultQualityPolicy
    });
  } else {
    // If the policies are missing/empty in the existing document, populate them so they appear in the Admin Settings
    let needsUpdate = false;
    if (!settings.shippingPolicy || settings.shippingPolicy === '..' || settings.shippingPolicy === ',,') {
      settings.shippingPolicy = defaultShippingPolicy;
      needsUpdate = true;
    }
    if (!settings.returnsPolicy || settings.returnsPolicy === '..' || settings.returnsPolicy === ',,') {
      settings.returnsPolicy = defaultReturnsPolicy;
      needsUpdate = true;
    }
    if (!settings.internationalPolicy || settings.internationalPolicy === '..' || settings.internationalPolicy === ',,') {
      settings.internationalPolicy = defaultInternationalPolicy;
      needsUpdate = true;
    }
    if (!settings.qualityPolicy || settings.qualityPolicy === '..' || settings.qualityPolicy === ',,') {
      settings.qualityPolicy = defaultQualityPolicy;
      needsUpdate = true;
    }
    if (needsUpdate) {
      await settings.save();
    }
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

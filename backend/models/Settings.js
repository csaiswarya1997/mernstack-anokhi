import mongoose from 'mongoose';

const settingsSchema = mongoose.Schema({
  address: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  whatsapp: { type: String, required: true },
  instagram: { type: String, required: true },
  workingHours: { type: String, default: '10 AM — 7 PM' },
  shippingPolicy: { type: String },
  returnsPolicy: { type: String },
  internationalPolicy: { type: String },
  qualityPolicy: { type: String }
}, {
  timestamps: true
});

const Settings = mongoose.model('Settings', settingsSchema);

export default Settings;

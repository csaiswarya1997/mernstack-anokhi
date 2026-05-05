import mongoose from 'mongoose';

const bespokeSchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    whatsapp: { type: String, required: true },
     requirement: { type: String, required: true },
     images: { type: [String], default: [] },
     adminNotes: { type: String, default: '' },
     status: { type: String, required: true, default: 'New' }, // New, Accepted, Processing, Rejected, Completed
     contactStatus: { type: [String], default: [] }, // Email, Phone, WhatsApp
   },
  {
    timestamps: true,
  }
);

const Bespoke = mongoose.model('Bespoke', bespokeSchema);

export default Bespoke;

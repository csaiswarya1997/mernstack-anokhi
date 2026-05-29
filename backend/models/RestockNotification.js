import mongoose from 'mongoose';

const restockNotificationSchema = mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Product'
    },
    productName: {
      type: String,
      required: true
    },
    productCode: {
      type: String
    },
    size: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phone: {
      type: String
    },
    status: {
      type: String,
      enum: ['Pending', 'Notified'],
      default: 'Pending'
    }
  },
  {
    timestamps: true
  }
);

const RestockNotification = mongoose.model('RestockNotification', restockNotificationSchema);
export default RestockNotification;

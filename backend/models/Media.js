import mongoose from 'mongoose';

const mediaSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['Logo', 'Thank You Card', 'Banner', 'Promotion', 'Other'],
    },
  },
  {
    timestamps: true,
  }
);

const Media = mongoose.model('Media', mediaSchema);

export default Media;

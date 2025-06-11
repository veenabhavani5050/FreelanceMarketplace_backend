// backend/models/Service.js
import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema(
  {
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref : 'User',
      required: true,
    },
    title      : { type: String, required: true },
    description: { type: String, default: '' },
    price      : { type: Number, required: true, min: 0 },
    category   : { type: String, default: '' },
    images     : [String],
    availability: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('Service', serviceSchema);

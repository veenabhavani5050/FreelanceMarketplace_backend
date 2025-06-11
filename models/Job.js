// backend/models/Job.js
import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref : 'User',
      required: true,
    },

    title      : { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category   : { type: String, required: true, trim: true },

    budget  : { type: Number, required: true, min: 0 },
    deadline: { type: Date,   required: true },

    location: { type: String, default: '' },
    requiredSkills: [String],
    attachments   : [String],          // array of file‑URL strings

    status: {
      type: String,
      enum: ['open', 'in-progress', 'completed', 'cancelled'],
      default: 'open',
    },

    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model('Job', jobSchema);

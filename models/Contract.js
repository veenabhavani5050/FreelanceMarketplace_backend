/* models/Contract.js */
import mongoose from 'mongoose';

/* Embedded milestone schema */
const milestoneSchema = new mongoose.Schema(
  {
    title : { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    dueDate: Date,
    status: {
      type: String,
      enum: ['pending', 'in progress', 'completed', 'paid'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

const contractSchema = new mongoose.Schema(
  {
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },

    client    : { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    freelancer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    title       : { type: String, required: true },
    description : { type: String, default: '' },
    totalAmount : { type: Number, required: true, min: 0 },

    status: {
      type: String,
      enum: ['active', 'completed', 'cancelled'],
      default: 'active',
    },

    milestones: [milestoneSchema],
  },
  { timestamps: true }
);

export default mongoose.model('Contract', contractSchema);

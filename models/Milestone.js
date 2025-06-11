/* models/Milestone.js */
import mongoose from 'mongoose';

const milestoneSchema = new mongoose.Schema(
  {
    contractId : { type: mongoose.Schema.Types.ObjectId, ref: 'Contract', required: true },
    title      : { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    amount     : { type: Number, required: true, min: 0 },
    dueDate    : Date,

    status: {
      type   : String,
      enum   : ['pending', 'in progress', 'completed', 'paid'],
      default: 'pending',
    },
    isPaid: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model('Milestone', milestoneSchema);

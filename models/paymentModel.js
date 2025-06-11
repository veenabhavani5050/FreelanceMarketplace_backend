/* models/Payment.js */
import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    user     : { type: mongoose.Schema.Types.ObjectId, ref: 'User',     required: true },
    contract : { type: mongoose.Schema.Types.ObjectId, ref: 'Contract', required: true },
    milestoneId:{ type: mongoose.Schema.Types.ObjectId, ref: 'Milestone', required: true },

    amount  : { type: Number, required: true },
    currency: { type: String, default: process.env.CURRENCY || 'usd' },

    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },

    paymentMethod: { type: String, default: 'stripe' },
    transactionId: { type: String },
    paymentDate  : { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model('Payment', paymentSchema);

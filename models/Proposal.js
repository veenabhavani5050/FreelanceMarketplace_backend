/* models/Proposal.js */
import mongoose from 'mongoose';

const proposalSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref : 'Job',
      required: true,
    },
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref : 'User',
      required: true,
    },
    coverLetter: { type: String, required: true, trim: true },
    proposedBudget   : { type: Number, required: true, min: 0 },
    expectedDuration : { type: String, default: '' },

    status: {
      type   : String,
      enum   : ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

/* Compound index: one proposal per job per freelancer */
proposalSchema.index({ job: 1, freelancer: 1 }, { unique: true });

export default mongoose.model('Proposal', proposalSchema);

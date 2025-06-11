import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    reviewer:           { type: mongoose.Schema.Types.ObjectId, ref: 'User',     required: true },
    reviewedFreelancer: { type: mongoose.Schema.Types.ObjectId, ref: 'User',     required: true },
    contract:           { type: mongoose.Schema.Types.ObjectId, ref: 'Contract', required: true },

    rating : { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, required: true, trim: true },
    reply  : { type: String, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model('Review', reviewSchema);

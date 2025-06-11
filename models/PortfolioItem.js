import mongoose from 'mongoose';

/**
 * A single portfolio entry that belongs to a freelancer.
 * Every entry can hold multiple uploaded files (S3 URLs).
 */
const portfolioSchema = new mongoose.Schema(
  {
    freelancer: {
      type    : mongoose.Schema.Types.ObjectId,
      ref     : 'User',
      required: true,
    },
    title: {
      type    : String,
      required: true,
      trim    : true,
    },
    description: {
      type: String,
      trim: true,
    },
    /* Array of S3 URLs */
    files: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.model('PortfolioItem', portfolioSchema);

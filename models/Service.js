import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Service title is required"],
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    samples: [String], // Cloudinary URLs
  },
  { timestamps: true }
);

export default mongoose.model("Service", serviceSchema);

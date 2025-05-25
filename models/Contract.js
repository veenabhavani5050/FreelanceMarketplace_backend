import mongoose from "mongoose";

const milestoneSchema = new mongoose.Schema({
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  status: {
    type: String,
    enum: ["pending", "in progress", "completed", "paid"],
    default: "pending",
  },
});

const contractSchema = new mongoose.Schema(
  {
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    client: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    freelancer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["proposed", "active", "completed", "cancelled"],
      default: "proposed",
    },
    milestones: [milestoneSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Contract", contractSchema);

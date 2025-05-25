import asyncHandler from "express-async-handler";
import stripe from "../utils/stripe.js";
import Contract from "../models/Contract.js";

// @desc    Create Stripe payment intent for a contract milestone
// @route   POST /api/payments/create-payment-intent
// @access  Private (Client)
export const createPaymentIntent = asyncHandler(async (req, res) => {
  const { contractId, milestoneIndex } = req.body;

  // Fetch the contract
  const contract = await Contract.findById(contractId);
  if (!contract) {
    res.status(404);
    throw new Error("Contract not found");
  }

  // Validate milestone index and status
  const milestone = contract.milestones[milestoneIndex];
  if (!milestone) {
    res.status(400);
    throw new Error("Invalid milestone index");
  }
  if (milestone.status === "paid") {
    res.status(400);
    throw new Error("Milestone already paid");
  }

  // Create Stripe payment intent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(milestone.amount * 100), // convert to cents
    currency: "usd",
    metadata: {
      contractId,
      milestoneIndex: milestoneIndex.toString(),
    },
  });

  res.status(200).json({
    clientSecret: paymentIntent.client_secret,
  });
});

// @desc    Mark milestone as paid after successful payment
// @route   POST /api/payments/mark-paid
// @access  Private (Client)
export const markMilestonePaid = asyncHandler(async (req, res) => {
  const { contractId, milestoneIndex } = req.body;

  const contract = await Contract.findById(contractId);
  if (!contract) {
    res.status(404);
    throw new Error("Contract not found");
  }

  if (!contract.milestones[milestoneIndex]) {
    res.status(400);
    throw new Error("Invalid milestone index");
  }

  contract.milestones[milestoneIndex].status = "paid";
  await contract.save();

  res.json({ message: "Milestone marked as paid." });
});

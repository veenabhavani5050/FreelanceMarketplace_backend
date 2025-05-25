// controllers/dashboardController.js
import asyncHandler from "express-async-handler";
import Job from "../models/Job.js";
import Service from "../models/Service.js";
import Contract from "../models/Contract.js";
import Payment from "../models/Payment.js";
import Review from "../models/Review.js";

// Freelancer Dashboard
export const getFreelancerDashboard = asyncHandler(async (req, res) => {
  const freelancerId = req.user._id;

  const [services, contracts, reviews, payments] = await Promise.all([
    Service.find({ freelancer: freelancerId }).lean(),
    Contract.find({ freelancer: freelancerId }).lean(),
    Review.find({ reviewedFreelancer: freelancerId }).lean(),
    Payment.find({ freelancer: freelancerId }).lean(),
  ]);

  const totalEarnings = payments.reduce((acc, p) => acc + p.amount, 0);

  res.json({
    servicesCount: services.length,
    contractsCount: contracts.length,
    reviewsCount: reviews.length,
    totalEarnings,
  });
});

// Client Dashboard
export const getClientDashboard = asyncHandler(async (req, res) => {
  const clientId = req.user._id;

  const [jobs, contracts, reviews, payments] = await Promise.all([
    Job.find({ client: clientId }).lean(),
    Contract.find({ client: clientId }).lean(),
    Review.find({ reviewer: clientId }).lean(),
    Payment.find({ client: clientId }).lean(),
  ]);

  const totalSpent = payments.reduce((acc, p) => acc + p.amount, 0);

  res.json({
    jobsPosted: jobs.length,
    contractsCount: contracts.length,
    reviewsLeft: reviews.length,
    totalSpent,
  });
});

// Optional: Combined dashboard based on user role
export const getDashboard = asyncHandler(async (req, res) => {
  if (req.user.role === "freelancer") {
    return getFreelancerDashboard(req, res);
  } else if (req.user.role === "client") {
    return getClientDashboard(req, res);
  } else {
    res.status(400);
    throw new Error("Invalid user role");
  }
});

// controllers/dashboardController.js
import Contract from "../models/Contract.js";
import Job from "../models/Job.js";
import Payment from "../models/paymentModel.js";
import Service from "../models/Service.js";
import Review from "../models/Review.js";

// @desc    Freelancer dashboard summary
export const getFreelancerDashboard = async (req, res) => {
  try {
    const freelancerId = req.user._id;

    // Fetch data concurrently for efficiency
    const [contracts, earningsAgg, services, reviews] = await Promise.all([
      Contract.find({ freelancer: freelancerId, status: { $in: ["active", "in-progress"] } }).lean(),
      Payment.aggregate([
        { $match: { freelancer: freelancerId, status: "completed" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Service.find({ freelancer: freelancerId }).lean(),
      Review.find({ reviewedFreelancer: freelancerId }).lean(),
    ]);

    const totalEarnings = earningsAgg[0]?.total || 0;

    res.json({
      activeContracts: contracts.length,
      totalEarnings,
      servicesCount: services.length,
      reviewsCount: reviews.length,
    });
  } catch (error) {
    console.error("Freelancer Dashboard Error:", error);
    res.status(500).json({ error: "Error fetching freelancer dashboard" });
  }
};

// @desc    Client dashboard summary
export const getClientDashboard = async (req, res) => {
  try {
    const clientId = req.user._id;

    const [jobs, contracts, reviews, payments] = await Promise.all([
      Job.find({ client: clientId }).lean(),
      Contract.find({ client: clientId, status: { $in: ["active", "in-progress"] } }).lean(),
      Review.find({ reviewer: clientId }).lean(),
      Payment.aggregate([
        { $match: { client: clientId, status: "completed" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
    ]);

    const totalSpent = payments[0]?.total || 0;

    res.json({
      totalJobs: jobs.length,
      activeContracts: contracts.length,
      reviewsLeft: reviews.length,
      totalSpent,
    });
  } catch (error) {
    console.error("Client Dashboard Error:", error);
    res.status(500).json({ error: "Error fetching client dashboard" });
  }
};

// @desc    Role-based dashboard dispatcher
export const getDashboard = async (req, res) => {
  try {
    const role = req.user.role;

    if (role === "freelancer") {
      return getFreelancerDashboard(req, res);
    } else if (role === "client") {
      return getClientDashboard(req, res);
    } else {
      return res.status(400).json({ error: "Unknown user role" });
    }
  } catch (err) {
    console.error("Dashboard Dispatcher Error:", err);
    res.status(500).json({ error: "Error fetching dashboard" });
  }
};

/* ───────── controllers/dashboardController.js ───────── */
import mongoose from 'mongoose';
import Contract  from '../models/Contract.js';
import Job       from '../models/Job.js';
import Payment   from '../models/paymentModel.js';
import Service   from '../models/Service.js';
import Review    from '../models/Review.js';

/**
 * Helper → last 12 months aggregate for charts
 */
const monthlySum = (fieldMatch) => ([
  { $match: fieldMatch },
  {
    $group: {
      _id      : { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
      count    : { $sum: 1 },
      totalAmt : { $sum: '$amount' },
    },
  },
  { $sort: { _id: 1 } },
]);

/* ───────── Freelancer dashboard ───────── */
export const getFreelancerDashboard = async (req, res) => {
  try {
    const id = new mongoose.Types.ObjectId(req.user._id);

    const [
      activeContracts,
      earningsAgg,
      services,
      reviews,
      earningsMonthly,
    ] = await Promise.all([
      Contract.countDocuments({ freelancer: id, status: { $in: ['active', 'in-progress'] } }),
      Payment.aggregate([{ $match: { freelancer: id, status: 'completed' } },
                         { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Service.countDocuments({ freelancer: id }),
      Review.countDocuments({ reviewedFreelancer: id }),
      Payment.aggregate(monthlySum({ freelancer: id, status: 'completed' })),
    ]);

    res.json({
      activeContracts,
      totalEarnings : earningsAgg[0]?.total || 0,
      servicesCount : services,
      reviewsCount  : reviews,
      charts        : {
        earningsLast12M : earningsMonthly,    // [{_id:'2025-01', totalAmt:1200, count:2}, …]
      },
    });
  } catch (err) {
    console.error('Freelancer Dashboard Error:', err);
    res.status(500).json({ error: 'Error fetching freelancer dashboard' });
  }
};

/* ───────── Client dashboard ───────── */
export const getClientDashboard = async (req, res) => {
  try {
    const id = new mongoose.Types.ObjectId(req.user._id);

    const [
      totalJobs,
      activeContracts,
      reviews,
      spentAgg,
      spendingMonthly,
    ] = await Promise.all([
      Job.countDocuments({ client: id }),
      Contract.countDocuments({ client: id, status: { $in: ['active', 'in-progress'] } }),
      Review.countDocuments({ reviewer: id }),
      Payment.aggregate([{ $match: { client: id, status: 'completed' } },
                         { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Payment.aggregate(monthlySum({ client: id, status: 'completed' })),
    ]);

    res.json({
      totalJobs,
      activeContracts,
      reviewsLeft : reviews,
      totalSpent  : spentAgg[0]?.total || 0,
      charts      : {
        spendingLast12M : spendingMonthly,
      },
    });
  } catch (err) {
    console.error('Client Dashboard Error:', err);
    res.status(500).json({ error: 'Error fetching client dashboard' });
  }
};

/* ───────── Role dispatcher ───────── */
export const getDashboard = (req, res) =>
  req.user.role === 'freelancer'
    ? getFreelancerDashboard(req, res)
    : req.user.role === 'client'
    ? getClientDashboard(req, res)
    : res.status(400).json({ error: 'Unknown user role' });

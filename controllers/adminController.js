/* controllers/adminController.js */
import asyncHandler from 'express-async-handler';
import User      from '../models/User.js';
import Job       from '../models/Job.js';
import Contract  from '../models/Contract.js';
import Payment   from '../models/paymentModel.js';   // ← correct filename

/* ───────────────────────────────────────────────
   USERS
   ─────────────────────────────────────────────── */
export const getAllUsers = asyncHandler(async (_req, res) => {
  const users = await User.find().select('-password');
  res.json(users);
});

export const blockUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isBlocked: true },
    { new: true }
  );
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json({ message: 'User blocked', user });
});

export const unblockUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isBlocked: false },
    { new: true }
  );
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json({ message: 'User unblocked', user });
});

/* ───────────────────────────────────────────────
   JOBS & CONTRACTS
   ─────────────────────────────────────────────── */
export const getAllJobs = asyncHandler(async (_req, res) => {
  const jobs = await Job.find().populate('client', 'name email');
  res.json(jobs);
});

export const getAllContracts = asyncHandler(async (_req, res) => {
  const contracts = await Contract.find().populate('client freelancer job');
  res.json(contracts);
});

/* ───────────────────────────────────────────────
   DASHBOARD STATS
   ─────────────────────────────────────────────── */
export const getAdminStats = asyncHandler(async (_req, res) => {
  const [users, jobs, contracts, revenueAgg] = await Promise.all([
    User.countDocuments(),
    Job.countDocuments(),
    Contract.countDocuments(),
    Payment.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]),
  ]);

  res.json({
    users,
    jobs,
    contracts,
    revenue: revenueAgg[0]?.total || 0,
  });
});

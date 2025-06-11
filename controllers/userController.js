import asyncHandler from 'express-async-handler';
import crypto from 'crypto';

import User from '../models/User.js';
import Job from '../models/Job.js';
import Contract from '../models/Contract.js';
import Proposal from '../models/Proposal.js';

import generateToken from '../utils/generateToken.js';
import sendEmail from '../utils/sendEmail.js';
import { resetPasswordTemplate } from '../utils/emailTemplates.js';

/* ───── AUTHENTICATED USER ACTIONS ───── */

// GET /api/users/profile
export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  if (!user) throw new Error('User not found');
  res.json(user);
});

// PUT /api/users/profile
export const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) throw new Error('User not found');

  const { name, email, password, profile = {} } = req.body;

  if (name) user.name = name.trim();
  if (email) user.email = email.toLowerCase().trim();
  if (password && password.length >= 6) user.password = password;

  if (!user.profile) user.profile = {};

  if (user.role === 'freelancer') {
    if (Array.isArray(profile.skills)) {
      user.profile.skills = profile.skills.map((s) => s.trim());
    }
    if (Array.isArray(profile.portfolio)) {
      user.profile.portfolio = profile.portfolio;
    }
    if (['full-time', 'part-time', 'freelance'].includes(profile.availability)) {
      user.profile.availability = profile.availability;
    }
    if (profile.bio && profile.bio.length <= 500) {
      user.profile.bio = profile.bio.trim();
    }
  }

  if (user.role === 'client') {
    if (profile.companyName) user.profile.companyName = profile.companyName.trim();
    if (profile.businessDetails) user.profile.businessDetails = profile.businessDetails.trim();
    if (profile.bio && profile.bio.length <= 500) {
      user.profile.bio = profile.bio.trim();
    }
  }

  const updated = await user.save();
  res.json({
    _id: updated._id,
    name: updated.name,
    email: updated.email,
    role: updated.role,
    profile: updated.profile,
    token: generateToken(updated._id),
  });
});

/* ───── ADMIN-ONLY CONTROLS ───── */

// GET /api/users
export const getAllUsers = asyncHandler(async (_req, res) => {
  const users = await User.find().select('-password');
  res.json(users);
});

// PUT /api/users/:id/block
export const blockUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new Error('User not found');
  user.isBlocked = true;
  await user.save();
  res.json({ message: 'User blocked successfully' });
});

// PUT /api/users/:id/unblock
export const unblockUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new Error('User not found');
  user.isBlocked = false;
  await user.save();
  res.json({ message: 'User unblocked successfully' });
});

/* ───── PASSWORD RESET FLOW ───── */

// POST /api/users/forgot-password
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) throw new Error('User not found');

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  const html = resetPasswordTemplate(resetURL);
  await sendEmail(email, 'Reset your password', html);

  res.json({ message: 'Reset link sent to email' });
});

// POST /api/users/reset-password/:token
export const resetPassword = asyncHandler(async (req, res) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) throw new Error('Invalid or expired token');
  if (!req.body.password || req.body.password.length < 6) {
    throw new Error('Password must be at least 6 characters');
  }

  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  res.json({ message: 'Password reset successful!' });
});

/* ───── CLIENT DASHBOARD ───── */

// GET /api/users/client-stats
export const getClientDashboardStats = asyncHandler(async (req, res) => {
  const clientId = req.user._id;

  const jobsPosted = await Job.countDocuments({ client: clientId });
  const activeContracts = await Contract.countDocuments({ client: clientId, status: 'active' });
  const pendingProposals = await Proposal.countDocuments({ client: clientId, status: 'pending' });

  res.json({ jobsPosted, activeContracts, pendingProposals });
});

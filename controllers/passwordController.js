// backend/controllers/passwordController.js
import crypto      from 'crypto';
import bcrypt      from 'bcryptjs';
import nodemailer  from 'nodemailer';
import asyncHandler from 'express-async-handler';
import User        from '../models/User.js';

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/* ───────── 1. Forgot password ───────── */
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) throw new Error('User not found');

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const link = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  await transporter.sendMail({
    to      : email,
    from    : 'noreply@freelancemarketplace.com',
    subject : 'Password Reset',
    text    : `Reset your password: ${link}`,
  });

  res.json({ message: 'Password reset link sent' });
});

/* ───────── 2. Reset password ───────── */
export const resetPassword = asyncHandler(async (req, res) => {
  const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashed,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) throw new Error('Invalid or expired token');

  if (!req.body.password || req.body.password.length < 6)
    throw new Error('Password must be ≥ 6 characters');

  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  res.json({ message: 'Password reset successful' });
});

/* ───────── 3. Change password (logged‑in) ───────── */
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');

  if (!user || !(await user.matchPassword(currentPassword)))
    throw new Error('Current password incorrect');

  user.password = newPassword;
  await user.save();

  res.json({ message: 'Password changed' });
});

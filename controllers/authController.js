/* ───────── controllers/authController.js ───────── */
import asyncHandler from 'express-async-handler';
import bcrypt       from 'bcryptjs';
import jwt          from 'jsonwebtoken';
import crypto       from 'crypto';
import nodemailer   from 'nodemailer';
import User         from '../models/User.js';

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

const cookieOpts = {
  httpOnly: true,
  secure  : process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge  : 30 * 24 * 60 * 60 * 1000, // 30 days
};

/* ───── Register ───── */
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !['client', 'freelancer'].includes(role)) {
    res.status(400);
    throw new Error('Name, email, password and valid role are required');
  }

  if (await User.findOne({ email })) {
    res.status(409);
    throw new Error('User already exists with that email');
  }

  // Hash password before create (model may not hide password)
  const hashed = await bcrypt.hash(password, 10);
  const user   = await User.create({ name, email, password: hashed, role });

  const token = signToken(user._id);
  res.cookie('token', token, cookieOpts);
  res.status(201).json({ _id: user._id, name, email, role, token });
});

/* ───── Login ───── */
export const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await bcrypt.compare(password, user.password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  const token = signToken(user._id);
  res.cookie('token', token, cookieOpts);
  res.json({ _id: user._id, name: user.name, email, role: user.role, token });
});

/* ───── Me / Logout ───── */
export const getMe = (_req, res) => res.json(res.locals.user);

export const logoutUser = (_req, res) => {
  res.clearCookie('token', cookieOpts);
  res.json({ message: 'Logged out' });
};

/* ───── Google OAuth callback ───── */
export const googleCallback = asyncHandler(async (req, res) => {
  const { _id } = req.user; // set by passport
  const token   = signToken(_id);

  res.cookie('token', token, cookieOpts);

  // Encode the JWT so it doesn’t break querystring
  const safe = encodeURIComponent(token);
  res.redirect(`${process.env.FRONTEND_URL}/oauth-success?token=${safe}`);
});

/* ───── Forgot Password ───── */
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.json({ message: 'If that email exists, a reset link was sent.' });
  }

  const raw  = crypto.randomBytes(32).toString('hex');
  const hash = crypto.createHash('sha256').update(raw).digest('hex');

  user.passwordResetToken   = hash;
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 min
  await user.save({ validateBeforeSave: false });

  const resetURL = `${process.env.FRONTEND_URL}/reset-password/${raw}`;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth   : { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

  await transporter.sendMail({
    from   : '"Freelance Marketplace" <no-reply@freemarket.com>',
    to     : user.email,
    subject: 'Password reset',
    html   : `<p>Reset your password <a href="${resetURL}">here</a>. Link expires in 10 minutes.</p>`,
  });

  res.json({ message: 'If that email exists, a reset link was sent.' });
});

/* ───── Reset Password ───── */
export const resetPassword = asyncHandler(async (req, res) => {
  const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    passwordResetToken  : hashed,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error('Token invalid or expired');
  }

  user.password            = await bcrypt.hash(req.body.password, 10);
  user.passwordResetToken   = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  const token = signToken(user._id);
  res.cookie('token', token, cookieOpts);
  res.json({ message: 'Password updated', token });
});

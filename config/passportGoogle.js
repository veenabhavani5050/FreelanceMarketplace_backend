import asyncHandler from 'express-async-handler';
import bcrypt   from 'bcryptjs';
import jwt      from 'jsonwebtoken';
import crypto   from 'crypto';
import nodemailer from 'nodemailer';
import User     from '../models/User.js';

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

/*  REGISTER */
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
    res.status(400);
    throw new Error('Please fill all fields');
  }

  if (await User.findOne({ email })) {
    res.status(400);
    throw new Error('User already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashedPassword, role });

  const token = generateToken(user._id);
  res.cookie('token', token, cookieOpts());
  res.status(201).json({ _id: user._id, name, email, role, token });
});

/* LOGIN */
export const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');

  if (user && (await bcrypt.compare(password, user.password))) {
    const token = generateToken(user._id);
    res.cookie('token', token, cookieOpts());
    res.json({ _id: user._id, name: user.name, email, role: user.role, token });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

/*  ME */
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json({ user });
});

/* LOGOUT */
export const logoutUser = (_req, res) => {
  res.clearCookie('token', cookieOpts());
  res.json({ message: 'Logged out successfully' });
};

/*  GOOGLE LOGIN CB */
export const googleLogin = asyncHandler(async (req, res) => {
  const { googleId, name, email } = req.user; // delivered from passport
  let user = await User.findOne({ googleId });

  if (!user) {
    const existing = await User.findOne({ email });
    if (existing) {
      existing.googleId = googleId;
      await existing.save();
      user = existing;
    } else {
      user = await User.create({ name, email, googleId, role: 'freelancer' });
    }
  }

  const token = generateToken(user._id);
  res.cookie('token', token, cookieOpts());
  res.redirect(`${process.env.FRONTEND_URL}/oauth-success?token=${token}`);
});

/* FORGOT PASSWORD */
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // generate & hash token
  const rawToken   = crypto.randomBytes(20).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

  user.resetPasswordToken   = hashedToken;
  user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 h
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${rawToken}`;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

  await transporter.sendMail({
    from: `"Freelance Marketplace" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: 'Reset Your Password',
    html: `
      <h2>Password Reset</h2>
      <p>Click the link below to reset your password. This link expires in 1 hour.</p>
      <a href="${resetUrl}">${resetUrl}</a>
    `,
  });

  res.json({ message: 'Reset link sent successfully.' });
});

/* RESET PASSWORD */
export const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired token');
  }

  user.password            = await bcrypt.hash(password, 10);
  user.resetPasswordToken  = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.json({ message: 'Password reset successful!' });
});

/* UTILS */
const cookieOpts = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 30 * 24 * 60 * 60 * 1000,
});

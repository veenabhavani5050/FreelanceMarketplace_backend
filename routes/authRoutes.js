/* ───────── routes/authRoutes.js ───────── */
import express   from 'express';
import passport  from 'passport';
import jwt       from 'jsonwebtoken';

import {
  registerUser,
  authUser,
  logoutUser,
  forgotPassword,
  resetPassword,
  getMe,
  googleCallback,
} from '../controllers/authController.js';

import { protect } from '../middleware/auth.js';

const router = express.Router();

/* ─────── Local auth ─────── */
router.post('/register', registerUser);
router.post('/login',    authUser);
router.post('/logout',   logoutUser);
router.get('/me', protect, getMe);

/* ─────── Password reset ─────── */
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

/* ─────── Google OAuth ─────── */
router.get(
  '/google',
  passport.authenticate('google', {
    scope : ['profile', 'email'],
    prompt: 'select_account',
  })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.FRONTEND_URL}/login` }),
  googleCallback
);

export default router;

/* ─────────── routes/userRoutes.js ─────────── */
import express from 'express';
import { protect, admin, clientOnly } from '../middleware/auth.js';
import {
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  blockUser,
  unblockUser,
  forgotPassword,
  resetPassword,
  getClientDashboardStats,
} from '../controllers/userController.js';

const router = express.Router();

/* Authenticated user profile */
router
  .route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

/* Client‑dashboard metrics */
router.get('/client-stats', protect, clientOnly, getClientDashboardStats);

/* Admin controls */
router.get('/',          protect, admin, getAllUsers);
router.put('/:id/block', protect, admin, blockUser);
router.put('/:id/unblock', protect, admin, unblockUser);

/* Public password reset */
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

export default router;

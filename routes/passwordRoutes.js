// backend/routes/passwordRoutes.js
import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  forgotPassword,
  resetPassword,
  changePassword,
} from '../controllers/passwordController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });

router.post('/forgot', limiter, forgotPassword);
router.post('/reset/:token', limiter, resetPassword);
router.post('/change', protect, changePassword);

export default router;

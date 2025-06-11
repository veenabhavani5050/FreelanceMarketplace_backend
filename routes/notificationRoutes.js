import express from 'express';
import {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  createNotification,
  deleteNotification,
} from '../controllers/notificationController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

/* List & create (create is internal/back‑office use) */
router
  .route('/')
  .get(protect, getUserNotifications)
  .post(protect, createNotification);

/* Mark every notification as read */
router.put('/mark-all-read', protect, markAllAsRead);

/* Single‑notification actions */
router.put('/:id/read', protect, markAsRead);
router.delete('/:id',   protect, deleteNotification);

export default router;

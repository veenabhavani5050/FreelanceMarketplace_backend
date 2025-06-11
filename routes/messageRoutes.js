// backend/routes/messageRoutes.js
import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  sendMessage,
  getMessagesWithUser,
} from '../controllers/chatController.js';

const router = express.Router();

router.post('/', protect, sendMessage);
router.get('/:userId', protect, getMessagesWithUser);

export default router;

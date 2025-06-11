/* routes/milestoneRoutes.js */
import express from 'express';
import {
  createMilestone,
  getMilestonesByContract,
  getMyMilestones,
  releaseMilestone,
} from '../controllers/milestoneController.js';
import { protect, clientOnly } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, clientOnly, createMilestone);
router.get('/my', protect, getMyMilestones);
router.get('/contract/:contractId', protect, getMilestonesByContract);
router.patch('/:id/release', protect, clientOnly, releaseMilestone);

export default router;

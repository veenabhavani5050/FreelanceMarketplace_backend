/* routes/adminRoutes.js */
import express from 'express';
import {
  getAllUsers,
  blockUser,
  unblockUser,
  getAllJobs,
  getAllContracts,
  getAdminStats,
} from '../controllers/adminController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

/* statistics dashboard */
router.get('/stats',          protect, admin, getAdminStats);

/* users */
router.get('/users',          protect, admin, getAllUsers);
router.put('/users/:id/block',   protect, admin, blockUser);
router.put('/users/:id/unblock', protect, admin, unblockUser);

/* jobs & contracts */
router.get('/jobs',       protect, admin, getAllJobs);
router.get('/contracts',  protect, admin, getAllContracts);

export default router;

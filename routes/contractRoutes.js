/* routes/contractRoutes.js */
import express from 'express';
import {
  createContract,
  listContracts,
  listClientContracts,
  listFreelancerContracts,
  getContractById,
  updateContract,
  updateMilestoneStatus,
} from '../controllers/contractController.js';
import { protect, clientOnly, freelancerOnly } from '../middleware/auth.js';

const router = express.Router();

/* create */
router.post('/', protect, clientOnly, createContract);

/* lists */
router.get('/',           protect, listContracts);
router.get('/client',     protect, clientOnly,     listClientContracts);
router.get('/freelancer', protect, freelancerOnly, listFreelancerContracts);

/* single */
router
  .route('/:id')
  .get(protect, getContractById)
  .put(protect, updateContract);

/* milestone status update */
router.put('/:id/milestone/:milestoneId', protect, updateMilestoneStatus);

export default router;

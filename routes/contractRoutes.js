/* routes/contractRoutes.js */
import express from 'express';
import {
  createContract,
  listContracts,
  listClientContracts,
  listFreelancerContracts,
  listContractsByClientId,    // NEW
  getContractById,
  updateContract,
  updateMilestoneStatus,
} from '../controllers/contractController.js';

import { protect, clientOnly, freelancerOnly } from '../middleware/auth.js';

const router = express.Router();

/* ---------- create ---------- */
router.post('/', protect, clientOnly, createContract);

/* ---------- lists ---------- */
router.get('/',            protect, listContracts);               // “my” list
router.get('/client',      protect, clientOnly,     listClientContracts);     // dashboard
router.get('/freelancer',  protect, freelancerOnly, listFreelancerContracts); // dashboard
router.get('/client/:clientId', protect, listContractsByClientId); // NEW

/* ---------- single contract ---------- */
router
  .route('/:id')
  .get(protect, getContractById)
  .put(protect, updateContract);

/* ---------- milestone status ---------- */
router.put('/:id/milestone/:milestoneId', protect, updateMilestoneStatus);

export default router;

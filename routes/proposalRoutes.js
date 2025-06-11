/* routes/proposalRoutes.js */
import express from 'express';
import {
  submitProposal,
  getProposalsForJob,
  getMyProposals,
  respondToProposal,
} from '../controllers/proposalController.js';
import { protect, freelancerOnly, clientOnly } from '../middleware/auth.js';

const router = express.Router();

/* /api/proposals */
router.post('/:jobId', protect, freelancerOnly, submitProposal);
router.get('/job/:jobId', protect, clientOnly, getProposalsForJob);
router.get('/my', protect, freelancerOnly, getMyProposals);
router.put('/:id', protect, clientOnly, respondToProposal);

export default router;

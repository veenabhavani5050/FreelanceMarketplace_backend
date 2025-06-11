import express from 'express';
import {
  createCheckoutSession,
  getContractPayments,
  getClientPayments,
  getFreelancerPayments,
  getMyPayments,          // ← NEW
  handleStripeWebhook,
} from '../controllers/paymentController.js';
import { protect, clientOnly } from '../middleware/auth.js';

const router = express.Router();

router.post('/create-session', protect, clientOnly, createCheckoutSession);
router.post('/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

router.get('/contract/:contractId', protect, getContractPayments);
router.get('/client',      protect, getClientPayments);
router.get('/freelancer',  protect, getFreelancerPayments);
router.get('/my',          protect, getMyPayments);     // ← NEW

export default router;

import express from 'express';
import {
  createCheckoutSession,
  handleStripeWebhook,
  getContractPayments,
  getClientPayments,
  getFreelancerPayments,
  getMyPayments,
  getPaymentHistory,          // ← NEW
} from '../controllers/paymentController.js';

import { protect, clientOnly } from '../middleware/auth.js';

const router = express.Router();

/* checkout + webhook */
router.post('/create-session', protect, clientOnly, createCheckoutSession);
router.post('/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

/* DB-based histories */
router.get('/contract/:contractId', protect, getContractPayments);
router.get('/client',               protect, getClientPayments);
router.get('/freelancer',           protect, getFreelancerPayments);
router.get('/my',                   protect, getMyPayments);

/* live Stripe charges */
router.get('/history',              protect, getPaymentHistory);   // ← NEW

export default router;

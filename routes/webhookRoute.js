import express from 'express';
import { handleStripeWebhook } from '../controllers/paymentController.js';

const router = express.Router();

/* Stripe raw body middleware is applied in app.js,
   so we keep the route lean here. */
router.post('/', handleStripeWebhook);

export default router;

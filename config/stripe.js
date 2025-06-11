/* config/stripe.js */
import Stripe from 'stripe';
import { STRIPE_SECRET } from './constants.js';

const stripe = new Stripe(STRIPE_SECRET, {
  apiVersion: '2023-10-16',
});

export default stripe;

import Stripe       from 'stripe';
import asyncHandler from 'express-async-handler';
import Payment      from '../models/paymentModel.js';
import Contract     from '../models/Contract.js';
import Milestone    from '../models/Milestone.js';
import Notification from '../models/Notification.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/* ───────── 1. Create Checkout Session ───────── */
export const createCheckoutSession = asyncHandler(async (req, res) => {
  try {
    const { contractId, milestoneId } = req.body;
    if (!contractId || !milestoneId) {
      res.status(400);
      throw new Error('contractId & milestoneId required');
    }

    const contract  = await Contract.findById(contractId);
    const milestone = await Milestone.findById(milestoneId);

    if (!contract || !milestone)
      throw new Error('Contract or milestone not found');
    if (milestone.isPaid)      throw new Error('Milestone already paid');
    if (milestone.amount <= 0) throw new Error('Invalid milestone amount');

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency    : process.env.CURRENCY || 'usd',
            product_data: { name: `Milestone – ${milestone.title}` },
            unit_amount : Math.round(milestone.amount * 100),
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url : `${process.env.FRONTEND_URL}/payment-cancelled`,
      metadata   : {
        userId     : req.user._id.toString(),
        contractId,
        milestoneId,
      },
    });

    return res.json({ url: session.url });
  } catch (err) {
    console.error('Stripe error:', err.message);
    res.status(500).json({ message: 'Stripe configuration error' });
  }
});

/* ───────── 2. Stripe Webhook ───────── */
export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    await processCheckoutCompleted(req.app, event.data.object);
  }
  res.json({ received: true });
};

const processCheckoutCompleted = async (app, session) => {
  const { userId, contractId, milestoneId } = session.metadata;
  const milestone = await Milestone.findById(milestoneId);
  if (!milestone || milestone.isPaid) return;

  /* 1. record Payment in DB */
  await Payment.create({
    user         : userId,
    contract     : contractId,
    milestoneId,
    amount       : milestone.amount,
    status       : 'completed',
    paymentMethod: 'stripe',
    transactionId: session.id,
  });

  /* 2. flag milestone paid */
  milestone.isPaid = true;
  milestone.status = 'paid';
  milestone.paidAt = new Date();
  await milestone.save();

  /* 3. notify freelancer */
  const contract   = await Contract.findById(contractId).select('freelancer');
  const message    = `Milestone "${milestone.title}" was paid`;

  const note = await Notification.create({
    user: contract.freelancer,
    type: 'payment',
    message,
  });

  app.locals.pushToUser?.(
    contract.freelancer.toString(),
    'payment:completed',
    { milestoneId, amount: milestone.amount, message, notification: note }
  );
};

/* ───────── 3. Read‑only DB Payment Queries ───────── */
export const getContractPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find({ contract: req.params.contractId })
    .populate('user', 'name email');
  res.json(payments);
});

export const getClientPayments = asyncHandler(async (req, res) => {
  const contracts = await Contract.find({ client: req.user._id }).select('_id');
  const contractIds = contracts.map((c) => c._id);

  const payments = await Payment.find({ contract: { $in: contractIds } })
    .populate('contract', 'title')
    .sort('-createdAt');

  res.json(payments);
});

export const getFreelancerPayments = asyncHandler(async (req, res) => {
  const contracts = await Contract.find({ freelancer: req.user._id }).select('_id');
  const contractIds = contracts.map((c) => c._id);

  const payments = await Payment.find({ contract: { $in: contractIds } })
    .populate('contract', 'title')
    .sort('-createdAt');

  res.json(payments);
});

/* ───────── 4. Unified “/my” endpoint ───────── */
export const getMyPayments = asyncHandler(async (req, res) => {
  if (req.user.role === 'client')      return getClientPayments(req, res);
  if (req.user.role === 'freelancer')  return getFreelancerPayments(req, res);
  res.status(403).json({ message: 'This role has no payment records.' });
});

/* ───────── 5. Live Stripe Charges (NEW) ───────── */
export const getPaymentHistory = asyncHandler(async (req, res) => {
  const customerEmail = req.user.email;

  /* optional: if you store a stripeCustomerId on User, use that instead */
  const charges = await stripe.charges.list({
    limit: 100,
    expand: ['data.invoice'],
  });

  // Filter by email just in case multiple users share the account
  const myCharges = charges.data.filter(
    (c) => c.billing_details?.email === customerEmail
  );

  res.json(myCharges);
});

/* controllers/reviewController.js */
import asyncHandler from 'express-async-handler';
import Review       from '../models/Review.js';
import Contract     from '../models/Contract.js';
import User         from '../models/User.js';
import Notification from '../models/Notification.js';

/* Helper: recalc freelancer rating */
const updateFreelancerRating = async (freelancerId) => {
  const stats = await Review.aggregate([
    { $match: { reviewedFreelancer: freelancerId } },
    { $group: { _id: null, avg: { $avg: '$rating' } } },
  ]);
  const avg = stats.length ? stats[0].avg : 0;
  await User.findByIdAndUpdate(freelancerId, { rating: avg.toFixed(1) });
};

/* 1. Add review (client) */
export const addReview = asyncHandler(async (req, res) => {
  const { reviewedFreelancer, contract, rating, comment } = req.body;
  if (!reviewedFreelancer || !contract || !rating || !comment)
    throw new Error('All fields are required');

  const ctr = await Contract.findById(contract);
  if (!ctr || !ctr.client.equals(req.user._id))
    throw new Error('You can only review your own contracts');

  if (!['completed', 'cancelled'].includes(ctr.status) &&
      !ctr.milestones.every((m) => m.status === 'paid'))
    throw new Error('Contract not completed/paid yet');

  const duplicate = await Review.findOne({
    reviewer: req.user._id,
    reviewedFreelancer,
    contract,
  });
  if (duplicate) throw new Error('You already reviewed this freelancer');

  const review = await Review.create({
    reviewer: req.user._id,
    reviewedFreelancer,
    contract,
    rating,
    comment,
  });

  await updateFreelancerRating(reviewedFreelancer);

  /* Notify freelancer in real‑time */
  const note = await Notification.create({
    user   : reviewedFreelancer,
    type   : 'review',
    message: `New review from ${req.user.name} (${rating} ⭐)`,
  });
  req.app.locals.pushToUser?.(reviewedFreelancer.toString(), 'review:new', note);

  res.status(201).json(review);
});

/* 2. Public list for a freelancer */
export const getFreelancerReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ reviewedFreelancer: req.params.id })
    .populate('reviewer', 'name')
    .sort('-createdAt');
  res.json(reviews);
});

/* 3. Freelancer replies (once) */
export const replyToReview = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;
  const { reply } = req.body;
  const review = await Review.findById(reviewId);

  if (!review) throw new Error('Review not found');
  if (!review.reviewedFreelancer.equals(req.user._id))
    throw new Error('Not authorised');
  if (review.reply) throw new Error('Reply already added');

  review.reply = reply;
  await review.save();
  res.json({ message: 'Reply added', review });
});

/* 4. “My” reviews for dashboard */
export const getMyReviews = asyncHandler(async (req, res) => {
  let filter = {};
  if (req.user.role === 'freelancer') {
    filter = { reviewedFreelancer: req.user._id };
  } else if (req.user.role === 'client') {
    filter = { reviewer: req.user._id };
  } else {
    return res.status(403).json({ message: 'This role has no reviews.' });
  }

  const reviews = await Review.find(filter)
    .populate('reviewer', 'name')
    .populate('reviewedFreelancer', 'name')
    .sort('-createdAt');

  res.json(reviews);
});

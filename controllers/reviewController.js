import asyncHandler from "express-async-handler";
import Review from "../models/Review.js";

// @desc    Add a review by client for a freelancer
// @route   POST /api/reviews
// @access  Private (Client)
export const addReview = asyncHandler(async (req, res) => {
  const { reviewedFreelancer, contract, rating, comment } = req.body;

  // Optional: you might want to validate if the client actually has a contract with the freelancer before allowing review

  const review = new Review({
    reviewer: req.user._id,
    reviewedFreelancer,
    contract,
    rating,
    comment,
  });

  await review.save();
  res.status(201).json(review);
});

// @desc    Get all reviews for a freelancer
// @route   GET /api/reviews/freelancer/:id
// @access  Public
export const getFreelancerReviews = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const reviews = await Review.find({ reviewedFreelancer: id })
    .populate("reviewer", "name")
    .sort({ createdAt: -1 }); // newest first

  res.json(reviews);
});

// @desc    Freelancer replies to a review
// @route   POST /api/reviews/:reviewId/reply
// @access  Private (Freelancer)
export const replyToReview = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;
  const { reply } = req.body;

  const review = await Review.findById(reviewId);
  if (!review) {
    res.status(404);
    throw new Error("Review not found");
  }

  if (review.reviewedFreelancer.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to reply to this review");
  }

  review.reply = reply;
  await review.save();

  res.json({ message: "Reply added", review });
});

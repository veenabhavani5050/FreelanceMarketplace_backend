import express from 'express';
import {
  addReview,
  getFreelancerReviews,
  replyToReview,
} from '../controllers/reviewController.js';
import { protect, clientOnly, freelancerOnly } from '../middleware/auth.js';

const router = express.Router();

/* Client adds review */
router.post('/', protect, clientOnly, addReview);

/* Public list */
router.get('/freelancer/:id', getFreelancerReviews);

/* Freelancer reply */
router.post('/reply/:reviewId', protect, freelancerOnly, replyToReview);

export default router;

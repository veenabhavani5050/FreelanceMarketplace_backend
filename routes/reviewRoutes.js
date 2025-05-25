import express from "express";
import {
  addReview,
  getFreelancerReviews,
  replyToReview,
} from "../controllers/reviewController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, addReview);
router.get("/freelancer/:id", getFreelancerReviews);
router.post("/reply/:reviewId", protect, replyToReview);

export default router;

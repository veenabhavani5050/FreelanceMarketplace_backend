import express from "express";
import {
  createPaymentIntent,
  markMilestonePaid,
} from "../controllers/paymentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/intent", protect, createPaymentIntent);
router.post("/confirm", protect, markMilestonePaid);

export default router;

import express from "express";
import {
  getFreelancerDashboard,
  getClientDashboard,
} from "../controllers/dashboardController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/freelancer", protect, getFreelancerDashboard);
router.get("/client", protect, getClientDashboard);

export default router;

// routes/dashboardRoutes.js
import express from "express";
import {
  getFreelancerDashboard,
  getClientDashboard,
  getDashboard,
} from "../controllers/dashboardController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Generic dashboard route: returns dashboard based on logged in user's role
router.get("/", protect, getDashboard);

// Optional: separate endpoints if you want explicit calls
router.get("/freelancer", protect, getFreelancerDashboard);
router.get("/client", protect, getClientDashboard);

export default router;

import express from "express";
import {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
} from "../controllers/jobController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/")
  .get(getAllJobs)
  .post(protect, createJob);

router.route("/:id")
  .get(getJobById)
  .put(protect, updateJob)
  .delete(protect, deleteJob);

export default router;

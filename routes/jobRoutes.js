// backend/routes/jobRoutes.js
import express from 'express';
import {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
  getMyJobs,
} from '../controllers/jobController.js';
import { protect, clientOnly } from '../middleware/auth.js';

const router = express.Router();

/* /api/jobs */
router
  .route('/')
  .post(protect, clientOnly, createJob)   // create
  .get(getJobs);                         // public list

/* /api/jobs/my (dashboard) */
router.get('/my', protect, clientOnly, getMyJobs);

/* /api/jobs/:id */
router
  .route('/:id')
  .get(getJobById)
  .put(protect, clientOnly, updateJob)
  .delete(protect, clientOnly, deleteJob);

export default router;

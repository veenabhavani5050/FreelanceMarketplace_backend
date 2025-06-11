// backend/routes/serviceRoutes.js
import express from 'express';
import {
  createService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService,
  getMyServices,
} from '../controllers/serviceController.js';
import { protect, freelancerOnly } from '../middleware/auth.js';

const router = express.Router();

/* /api/services */
router
  .route('/')
  .get(getAllServices)                           // public list
  .post(protect, freelancerOnly, createService); // create

/* /api/services/my */
router.get('/my', protect, freelancerOnly, getMyServices);

/* /api/services/:id */
router
  .route('/:id')
  .get(getServiceById)
  .put(protect, freelancerOnly, updateService)
  .delete(protect, freelancerOnly, deleteService);

export default router;

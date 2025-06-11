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
import { uploadArray } from '../middleware/uploadMiddleware.js';   // ⬅ Multer

const router = express.Router();

/* /api/services */
router
  .route('/')
  .get(getAllServices)                                    // public list
  .post(protect, freelancerOnly, uploadArray, createService); // create ⬅ files OK

/* /api/services/my */
router.get('/my', protect, freelancerOnly, getMyServices);

/* /api/services/:id */
router
  .route('/:id')
  .get(getServiceById)
  .put(protect, freelancerOnly, uploadArray, updateService)  // ⬅ files OK
  .delete(protect, freelancerOnly, deleteService);

export default router;

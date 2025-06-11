// routes/searchRoutes.js
import express from 'express';
import { searchDispatcher } from '../controllers/searchController.js';

const router = express.Router();

/* Example: /api/search?type=freelancers&q=react&page=2&limit=20 */
router.get('/', searchDispatcher);

export default router;

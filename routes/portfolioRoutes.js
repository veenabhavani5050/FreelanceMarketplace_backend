// backend/routes/portfolioRoutes.js
import express from 'express';
import {
  createPortfolioItem,
  getMyPortfolio,
  getPortfolioByFreelancer,
  deletePortfolioItem,
} from '../controllers/portfolioController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/',            protect, createPortfolioItem);        // upload new
router.get('/my',           protect, getMyPortfolio);             // my items
router.get('/freelancer/:id', getPortfolioByFreelancer);          // public list
router.delete('/:id',       protect, deletePortfolioItem);        // delete item

export default router;

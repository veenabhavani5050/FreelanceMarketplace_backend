import asyncHandler      from 'express-async-handler';
import PortfolioItem     from '../models/PortfolioItem.js';
import uploadToS3        from '../utils/uploadToS3.js';   // helper you created
import { uploadArray }   from '../middleware/uploadMiddleware.js';

/* ------------------------------------------------------------------
   POST /api/portfolios
   Create a new portfolio item (freelancer only)
   ------------------------------------------------------------------ */
export const createPortfolioItem = [
  /* Multer parses multipart/form‑data (up to 5 files in memory) */
  uploadArray,
  asyncHandler(async (req, res) => {
    if (req.user.role !== 'freelancer') {
      res.status(403);
      throw new Error('Only freelancers can create portfolio items');
    }

    const { title, description = '' } = req.body;
    if (!title) {
      res.status(400);
      throw new Error('Title is required');
    }

    /* Upload every file buffer to S3 */
    const fileUrls = [];
    if (req.files) {
      for (const f of req.files) {
        const url = await uploadToS3(f.buffer, f.mimetype);
        fileUrls.push(url);
      }
    }

    const item = await PortfolioItem.create({
      freelancer : req.user._id,
      title,
      description,
      files      : fileUrls,
    });

    res.status(201).json(item);
  }),
];

/* ------------------------------------------------------------------
   GET /api/portfolios/my
   Return the logged‑in freelancer’s portfolio items
   ------------------------------------------------------------------ */
export const getMyPortfolio = asyncHandler(async (req, res) => {
  if (req.user.role !== 'freelancer') {
    res.status(403);
    throw new Error('Only freelancers have a portfolio');
  }
  const items = await PortfolioItem.find({ freelancer: req.user._id })
                                   .sort('-createdAt');
  res.json(items);
});

/* ------------------------------------------------------------------
   GET /api/portfolios/freelancer/:id
   Public – list a freelancer’s portfolio
   ------------------------------------------------------------------ */
export const getPortfolioByFreelancer = asyncHandler(async (req, res) => {
  const items = await PortfolioItem.find({ freelancer: req.params.id })
                                   .sort('-createdAt');
  res.json(items);
});

/* ------------------------------------------------------------------
   DELETE /api/portfolios/:id
   Remove a portfolio item (owner or admin)
   ------------------------------------------------------------------ */
export const deletePortfolioItem = asyncHandler(async (req, res) => {
  const item = await PortfolioItem.findById(req.params.id);
  if (!item) {
    res.status(404);
    throw new Error('Portfolio item not found');
  }

  const isOwner = item.freelancer.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorised to delete this item');
  }

  await item.deleteOne();
  res.json({ message: 'Portfolio item deleted' });
});

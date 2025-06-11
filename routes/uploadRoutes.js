// backend/routes/uploadRoutes.js
import express from 'express';
import { protect } from '../middleware/auth.js';
import { uploadSingle } from '../middleware/uploadMiddleware.js';
import { uploadBuffer } from '../utils/cloudinary.js';

const router = express.Router();

/* POST /api/upload/image */
router.post('/image', protect, uploadSingle, async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  try {
    const url = await uploadBuffer(req.file.buffer, 'images');
    res.status(201).json({ url });
  } catch (err) {
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
});

export default router;

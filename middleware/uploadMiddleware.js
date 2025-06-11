// backend/middleware/uploadMiddleware.js
import multer from 'multer';

const storage = multer.memoryStorage(); // buffer in memory → Cloudinary
const limits = { fileSize: 5 * 1024 * 1024 }; // 5 MB

export const uploadSingle = multer({ storage, limits }).single('file');
export const uploadArray  = multer({ storage, limits }).array('files', 5);

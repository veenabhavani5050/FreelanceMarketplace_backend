/* ───────── middleware/uploadMiddleware.js ─────────
   Multer in‑memory buffer → later pushed to S3
   (controllers call  uploadToS3() for each file)
──────────────────────────────────────────────────── */
import multer from 'multer';

const storage = multer.memoryStorage();          // file kept in RAM buffer
const limits  = { fileSize: 10 * 1024 * 1024 };   // 10 MB max / file

export const uploadSingle = multer({ storage, limits }).single('file');     // 1 file
export const uploadArray  = multer({ storage, limits }).array('files', 10); // up to 10

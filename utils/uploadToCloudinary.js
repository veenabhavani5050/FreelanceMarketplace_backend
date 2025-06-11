// utils/uploadToCloudinary.js
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';

/* Configure once from .env */
cloudinary.config({
  cloud_name : process.env.CLOUDINARY_CLOUD_NAME,
  api_key    : process.env.CLOUDINARY_API_KEY,
  api_secret : process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a Multer file buffer to Cloudinary.
 * @param {Express.Multer.File} file
 * @returns {Promise<cloudinary.UploadApiResponse>}
 */
const uploadToCloudinary = (file) =>
  new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'portfolio_samples' },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    streamifier.createReadStream(file.buffer).pipe(uploadStream);
  });

export default uploadToCloudinary;

/* ───────── utils/uploadToS3.js ───────── */
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { randomBytes }      from 'crypto';
import s3                   from './s3Client.js';

const bucket = process.env.AWS_S3_BUCKET;

/**
 * Upload a buffer to S3 and return the public URL.
 * @param {Buffer}  buffer   – file bytes from multer
 * @param {string}  mimetype – file MIME type
 * @returns {string} public‑read URL
 */
const uploadToS3 = async (buffer, mimetype) => {
  const key = `${Date.now()}-${randomBytes(8).toString('hex')}`;

  await s3.send(
    new PutObjectCommand({
      Bucket      : bucket,
      Key         : key,
      Body        : buffer,
      ContentType : mimetype,
      ACL         : 'public-read',          // make it publicly accessible
    })
  );

  return `https://${bucket}.s3.amazonaws.com/${key}`;
};

export default uploadToS3;

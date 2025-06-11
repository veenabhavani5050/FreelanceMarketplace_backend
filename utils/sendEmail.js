/* utils/sendEmail.js */
import nodemailer from 'nodemailer';
import { FRONTEND_URL } from '../config/constants.js';

/**
 * Send an HTML email using Gmail SMTP
 * @param {string} to       Recipient address
 * @param {string} subject  Subject line
 * @param {string} html     HTML body
 */
const sendEmail = async (to, subject, html) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"Freelance Platform" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    /* eslint-disable no-console */
    console.log(`✉️  Email sent: ${info.messageId}`);
  } catch (err) {
    console.error(`✖ Email failed: ${err.message}`);
    throw new Error('Failed to send email');
  }
};

export default sendEmail;

/* utils/emailTemplates.js */

/**
 * Password‑reset e‑mail (10‑minute expiry)
 * @param {string} resetLink   Absolute URL to the reset page
 * @returns {string}           HTML content
 */
export const resetPasswordTemplate = (resetLink) => `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:auto;padding:24px;border:1px solid #eee;border-radius:8px;">
    <h2 style="color:#007bff;">Reset Your Password</h2>
    <p>You requested a password reset for your Freelance Platform account.</p>
    <p style="text-align:center;margin:32px 0;">
      <a href="${resetLink}" style="padding:12px 24px;background:#007bff;color:#fff;text-decoration:none;border-radius:6px;">
        Reset Password
      </a>
    </p>
    <p>This link is valid for <strong>10&nbsp;minutes</strong>.</p>
    <p>If you did not request this, simply ignore this email.</p>
    <hr style="margin:32px 0;border:none;border-top:1px solid #eee">
    <p style="font-size:14px;color:#666;">
      Trouble with the button? Copy and paste this URL into your browser:<br>
      <a href="${resetLink}">${resetLink}</a>
    </p>
    <p style="margin-top:32px;">Thanks,<br>The Freelance Platform Team</p>
  </div>
`;

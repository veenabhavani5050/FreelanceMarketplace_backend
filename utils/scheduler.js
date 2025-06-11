// backend/utils/scheduler.js
import cron from 'node-cron';
import Milestone from '../models/Milestone.js';
import Contract  from '../models/Contract.js';
import Notification from '../models/Notification.js';

export const startAutoRelease = (app) => {
  /* Every day at 02:00 AM server time */
  cron.schedule('0 2 * * *', async () => {
    const now = new Date();
    /* find completed but unpaid milestones older than 14 days */
    const ms = await Milestone.find({
      status : 'completed',
      isPaid : false,
      updatedAt: { $lte: new Date(now - 14 * 24 * 60 * 60 * 1000) },
    });

    for (const m of ms) {
      const contract = await Contract.findById(m.contractId);
      if (!contract) continue;

      m.status = 'paid';
      m.isPaid = true;
      await m.save();

      await Notification.create({
        user : contract.freelancer,
        type : 'payment',
        message: `Milestone "${m.title}" auto‑released`,
      });

      app.locals.pushToUser?.(
        contract.freelancer.toString(),
        'payment:autoReleased',
        { milestoneId: m._id, amount: m.amount }
      );
    }
  });
};

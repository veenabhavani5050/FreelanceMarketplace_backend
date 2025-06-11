import asyncHandler from 'express-async-handler';
import Notification from '../models/Notification.js';

// GET /api/notifications?onlyUnread=true
export const getUserNotifications = asyncHandler(async (req, res) => {
  const filter = { user: req.user._id };
  if (req.query.onlyUnread === 'true') filter.isRead = false;

  const notes = await Notification.find(filter).sort('-createdAt');
  res.json(notes);
});

// PUT /api/notifications/:id/read
export const markAsRead = asyncHandler(async (req, res) => {
  const note = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { $set: { isRead: true } },
    { new: true }
  );
  if (!note) {
    res.status(404);
    throw new Error('Notification not found');
  }
  res.json(note);
});

// PUT /api/notifications/mark-all-read
export const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { user: req.user._id, isRead: false },
    { $set: { isRead: true } }
  );
  res.json({ message: 'All notifications marked as read' });
});

// POST /api/notifications
export const createNotification = asyncHandler(async (req, res) => {
  const { user, type, message } = req.body;
  if (!user || !type || !message) {
    res.status(400);
    throw new Error('user, type, and message are required');
  }

  const validTypes = ['contract', 'payment', 'review', 'message'];
  if (!validTypes.includes(type)) {
    res.status(400);
    throw new Error('Invalid notification type');
  }

  const note = await Notification.create({ user, type, message });
  res.status(201).json(note);
});

// DELETE /api/notifications/:id
export const deleteNotification = asyncHandler(async (req, res) => {
  const deleted = await Notification.findOneAndDelete({
    _id : req.params.id,
    user: req.user._id,
  });
  if (!deleted) {
    res.status(404);
    throw new Error('Notification not found');
  }
  res.json({ message: 'Notification deleted' });
});

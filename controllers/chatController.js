// backend/controllers/chatController.js
import asyncHandler  from 'express-async-handler';
import Message       from '../models/Message.js';
import Notification  from '../models/Notification.js';

/* helper */
const notify = (io, user, payload) => {
  io.to(user.toString()).emit('message:receive', payload);
  return Notification.create({
    user,
    type: 'message',
    message: `New message from ${payload.senderName}`,
  });
};

/* 1️⃣ Send message */
export const sendMessage = asyncHandler(async (req, res) => {
  const { recipientId, content } = req.body;
  if (!recipientId || !content) throw new Error('recipientId & content required');

  const msg = await Message.create({
    sender   : req.user._id,
    recipient: recipientId,
    content,
  });

  const payload = {
    _id      : msg._id,
    sender   : req.user._id,
    senderName: req.user.name,
    recipient: recipientId,
    content,
    createdAt: msg.createdAt,
  };

  req.app.locals.pushToUser?.(recipientId.toString(), 'message:new', payload);
  await notify(req.app.locals.io, recipientId, payload);

  res.status(201).json(payload);
});

/* 2️⃣ Get messages with specific user */
export const getMessagesWithUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const messages = await Message.find({
    $or: [
      { sender: req.user._id, recipient: userId },
      { sender: userId, recipient: req.user._id },
    ],
  }).sort({ createdAt: 1 });

  /* mark received as read */
  await Message.updateMany(
    { sender: userId, recipient: req.user._id, isRead: false },
    { $set: { isRead: true } }
  );

  res.json(messages);
});

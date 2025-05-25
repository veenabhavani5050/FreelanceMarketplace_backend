import asyncHandler from "express-async-handler";

// Dummy in-memory notifications for demo
let notifications = [
  { id: "1", userId: "user1", message: "Notification 1", read: false },
  { id: "2", userId: "user1", message: "Notification 2", read: false },
];

// @desc    Get notifications for logged-in user
// @route   GET /api/notifications
// @access  Private
export const getUserNotifications = asyncHandler(async (req, res) => {
  const userId = req.user._id.toString(); // Make sure to convert ObjectId to string if needed
  const userNotifications = notifications.filter(n => n.userId === userId);
  res.json(userNotifications);
});

// @desc    Mark a notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
export const markAsRead = asyncHandler(async (req, res) => {
  const userId = req.user._id.toString();
  const notificationId = req.params.id;

  const notification = notifications.find(
    n => n.id === notificationId && n.userId === userId
  );

  if (!notification) {
    res.status(404);
    throw new Error("Notification not found");
  }

  notification.read = true;
  res.json({ message: "Notification marked as read", notification });
});

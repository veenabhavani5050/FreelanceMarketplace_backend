import Message from '../models/Message.js';
export const sendMessage = async (req, res) => {
  const { recipientId, content } = req.body;

  if (!recipientId || !content) {
    return res.status(400).json({ message: 'Recipient and content are required' });
  }

  try {
    const message = await Message.create({
      sender: req.user._id,
      recipient: recipientId,
      content,
    });

    const io = req.app.locals.io;
    io.to(recipientId.toString()).emit('newMessage', {
      _id: message._id,
      sender: req.user._id,
      recipient: recipientId,
      content,
      createdAt: message.createdAt,
    });

    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: 'Error sending message', error: err.message });
  }
};

export const getMessagesWithUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, recipient: userId },
        { sender: userId, recipient: req.user._id },
      ],
    })
      .sort({ createdAt: 1 })
      .populate('sender', 'name profileImage')
      .populate('recipient', 'name profileImage');

    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching messages', error: err.message });
  }
};

export const getRecentContacts = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ sender: req.user._id }, { recipient: req.user._id }],
    })
      .sort({ createdAt: -1 })
      .populate('sender', 'name profileImage')
      .populate('recipient', 'name profileImage');

    const contactsMap = new Map();
    messages.forEach((msg) => {
      const otherUser =
        msg.sender._id.toString() === req.user._id.toString() ? msg.recipient : msg.sender;
      if (!contactsMap.has(otherUser._id.toString())) {
        contactsMap.set(otherUser._id.toString(), otherUser);
      }
    });

    const contacts = Array.from(contactsMap.values());
    res.status(200).json(contacts);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get contacts', error: err.message });
  }
};

/* sockets/socketHandler.js
   ---------------------------------------------------------------------------
   Centralises Socket.IO room logic + exports helpers:
     broadcast(room, event, payload)
     pushToUser(userId, event, payload)
--------------------------------------------------------------------------- */
export default function socketHandler(io) {
  io.on('connection', (socket) => {
    console.log(`🔌  Socket connected: ${socket.id}`);

    /* Front‑end MUST emit { register: userId } right after connect */
    socket.on('register', (userId) => {
      if (userId) {
        socket.join(userId);
        socket.data.userId = userId;
        console.log(`👤  User ${userId} joined personal room`);
      }
    });

    /* Generic room helpers */
    socket.on('joinRoom',  (room) => socket.join(room));
    socket.on('leaveRoom', (room) => socket.leave(room));

    /* Lightweight relay for chat if you want to send without hitting REST */
    socket.on('message:send', ({ recipientId, text }) => {
      if (recipientId && text) {
        io.to(recipientId).emit('message:new', {
          from: socket.data.userId,
          text,
          createdAt: new Date(),
        });
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  /* ------------ helpers for controllers ------------- */
  const broadcast = (room, event, payload) => io.to(room).emit(event, payload);
  const pushToUser = (userId, event, payload) => io.to(userId).emit(event, payload);

  return { broadcast, pushToUser };
}

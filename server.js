/* ─────────────── server.js ─────────────── */
import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import { Server } from 'socket.io';

import app from './app.js';
import socketHandler from './sockets/socketHandler.js';
import { startAutoRelease } from './utils/scheduler.js';  // 🌟 NEW

const PORT         = process.env.PORT         || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

/* HTTP + Socket.IO */
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: FRONTEND_URL, credentials: true },
});
app.locals.io = io;                                  // req.io available everywhere

/* Initialise central socket handler */
const { broadcast, pushToUser } = socketHandler(io);
app.locals.broadcast  = broadcast;
app.locals.pushToUser = pushToUser;

/* Optional daily auto‑release cron */
startAutoRelease(app);                                // 🌟 NEW

/* Graceful shutdown */
const exit = (type, err) => {
  console.error(`${type} ❌`, err);
  server.close(() => process.exit(1));
};
process.on('unhandledRejection', (err) => exit('UNHANDLED PROMISE', err));
process.on('uncaughtException',  (err) => exit('UNCAUGHT EXCEPTION', err));

server.listen(PORT, () =>
  console.log(`🚀  Server running at http://localhost:${PORT}`)
);

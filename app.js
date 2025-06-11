/* ─────────────── app.js ─────────────── */
import express       from 'express';
import dotenv        from 'dotenv';
import cors          from 'cors';
import helmet        from 'helmet';
import compression   from 'compression';
import rateLimit     from 'express-rate-limit';
import session       from 'express-session';
import passport      from 'passport';
import MongoStore    from 'connect-mongo';
import cookieParser  from 'cookie-parser';

import connectDB from './config/db.js';
import './config/passport.js';

/* Stripe webhook (raw) */
import webhookRouter from './routes/webhookRoute.js';

/* Middleware */
import logger          from './middleware/logger.js';
import { protect }     from './middleware/auth.js';
import { errorHandler } from './middleware/errorHandler.js';

/* Routes */
import passwordRoutes     from './routes/passwordRoutes.js';
import authRoutes         from './routes/authRoutes.js';
import userRoutes         from './routes/userRoutes.js';
import jobRoutes          from './routes/jobRoutes.js';
import dashboardRoutes    from './routes/dashboardRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import serviceRoutes      from './routes/serviceRoutes.js';
import contractRoutes     from './routes/contractRoutes.js';
import reviewRoutes       from './routes/reviewRoutes.js';
import searchRoutes       from './routes/searchRoutes.js';
import paymentRoutes      from './routes/paymentRoutes.js';
import milestoneRoutes    from './routes/milestoneRoutes.js';
import proposalRoutes     from './routes/proposalRoutes.js';
import adminRoutes        from './routes/adminRoutes.js';
import messageRoutes      from './routes/messageRoutes.js';
import uploadRoutes       from './routes/uploadRoutes.js';   // 🌟 NEW

dotenv.config();
connectDB();

const app = express();

/* attach Socket.IO instance to every request */
app.use((req, _res, next) => {
  req.io = app.locals.io;
  next();
});

/* Stripe webhook BEFORE body‑parsers */
app.use(
  '/api/webhook',
  express.raw({ type: 'application/json' }),
  webhookRouter
);

/* Global middleware */
app.set('trust proxy', 1);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(compression());
app.use(logger);

/* CORS */
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);

/* Session for Google OAuth */
app.use(
  session({
    secret: process.env.SESSION_SECRET || process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      ttl: 60 * 60 * 24,
    }),
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 86_400_000,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

/* Rate‑limit auth endpoints */
const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100,
});
app.use('/api/auth', authLimiter);

/* ---------- Public & protected routes ---------- */
app.use('/api/auth',         authRoutes);
app.use('/api/password',     passwordRoutes);
app.use('/api/users',        userRoutes);
app.use('/api/jobs',         jobRoutes);
app.use('/api/search',       searchRoutes);
app.use('/api/services',     protect, serviceRoutes);
app.use('/api/reviews',      protect, reviewRoutes);
app.use('/api/contracts',    protect, contractRoutes);
app.use('/api/dashboard',    protect, dashboardRoutes);
app.use('/api/notifications',protect, notificationRoutes);
app.use('/api/payments',     protect, paymentRoutes);
app.use('/api/milestones',   protect, milestoneRoutes);
app.use('/api/proposals',    protect, proposalRoutes);
app.use('/api/admin',        protect, adminRoutes);
app.use('/api/messages',     protect, messageRoutes);
app.use('/api/upload',       protect, uploadRoutes);        // 🌟 NEW

/* 404 & error handlers */
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));
app.use(errorHandler);

export default app;

/* ─────────────── app.js ─────────────── */
import express        from 'express';
import dotenv         from 'dotenv';
import cors           from 'cors';
import helmet         from 'helmet';
import compression    from 'compression';
import rateLimit      from 'express-rate-limit';
import session        from 'express-session';
import passport       from 'passport';
import MongoStore     from 'connect-mongo';
import cookieParser   from 'cookie-parser';

import connectDB      from './config/db.js';
import './config/passport.js';

/* --- Stripe webhook must read the raw body -------------------------- */
import webhookRouter  from './routes/webhookRoute.js';

/* --- Custom middleware --------------------------------------------- */
import logger            from './middleware/logger.js';
import { protect }       from './middleware/auth.js';
import { errorHandler }  from './middleware/errorHandler.js';

/* --- Route files ---------------------------------------------------- */
import authRoutes         from './routes/authRoutes.js';
import passwordRoutes     from './routes/passwordRoutes.js';
import userRoutes         from './routes/userRoutes.js';
import jobRoutes          from './routes/jobRoutes.js';
import serviceRoutes      from './routes/serviceRoutes.js';
import reviewRoutes       from './routes/reviewRoutes.js';
import contractRoutes     from './routes/contractRoutes.js';
import proposalRoutes     from './routes/proposalRoutes.js';
import milestoneRoutes    from './routes/milestoneRoutes.js';
import paymentRoutes      from './routes/paymentRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import dashboardRoutes    from './routes/dashboardRoutes.js';
import adminRoutes        from './routes/adminRoutes.js';
import searchRoutes       from './routes/searchRoutes.js';
import messageRoutes      from './routes/messageRoutes.js';
import uploadRoutes       from './routes/uploadRoutes.js';
import portfolioRoutes    from './routes/portfolioRoutes.js';   // 🆕

/* ------------------------------------------------------------------- */
dotenv.config();
connectDB();

/* ------------------------------------------------------------------- */
const app          = express();
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

/* Make the Socket.IO instance available inside controllers */
app.use((req, _res, next) => {
  req.io = app.locals.io;     // set by server.js
  next();
});

/* ---------- Stripe webhook (NEEDS raw body, **before** any json parser) */
app.use(
  '/api/webhook',
  express.raw({ type: 'application/json' }),
  webhookRouter
);

/* ---------- Global middleware stack -------------------------------- */
app.set('trust proxy', 1);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(compression());
app.use(logger);

/* ---------- CORS ---------------------------------------------------- */
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);

/* ---------- Session (Google OAuth state) --------------------------- */
app.use(
  session({
    secret           : process.env.SESSION_SECRET || process.env.JWT_SECRET,
    resave           : false,
    saveUninitialized: false,
    store            : MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      ttl     : 60 * 60 * 24,      // one day
    }),
    cookie: {
      secure  : process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'lax',
      maxAge  : 86_400_000,        // one day
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

/* ---------- Rate‑limit all /auth endpoints ------------------------- */
const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,  // 10 min window
  max     : 100,             // limit each IP to 100 reqs
});
app.use('/api/auth', authLimiter);

/* ---------- PUBLIC routes (no token required) ---------------------- */
app.use('/api/auth',      authRoutes);
app.use('/api/password',  passwordRoutes);
app.use('/api/users',     userRoutes);
app.use('/api/jobs',      jobRoutes);
app.use('/api/search',    searchRoutes);

/* Services & reviews are mixed: public GET + auth‑guarded POST/PUT */
app.use('/api/services',  serviceRoutes);
app.use('/api/reviews',   reviewRoutes);

/* ---------- PROTECTED routes (token required first) ---------------- */
app.use('/api/contracts',     protect, contractRoutes);
app.use('/api/proposals',     protect, proposalRoutes);
app.use('/api/milestones',    protect, milestoneRoutes);
app.use('/api/payments',      protect, paymentRoutes);
app.use('/api/notifications', protect, notificationRoutes);
app.use('/api/dashboard',     protect, dashboardRoutes);
app.use('/api/admin',         protect, adminRoutes);
app.use('/api/messages',      protect, messageRoutes);
app.use('/api/upload',        protect, uploadRoutes);

/* Portfolios:  GETs are public, writes are guarded inside controller */
app.use('/api/portfolios', portfolioRoutes);          // 🆕

/* ---------- 404 & error handler ------------------------------------ */
app.use((req, res) =>
  res.status(404).json({ message: 'Route not found' })
);
app.use(errorHandler);

export default app;
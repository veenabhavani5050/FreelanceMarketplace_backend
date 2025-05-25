// app.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";

import connectDB from "./config/db.js";

import userRoutes from "./routes/userRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

import { errorHandler } from "./middleware/errorHandler.js";
import logger from "./middleware/logger.js";


dotenv.config();
connectDB();

const app = express();

app.use(express.json());

// Add security headers
app.use(helmet());

// Enable CORS for frontend URL or all origins (adjust for production)
app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/notifications", notificationRoutes);

// 404 route handler
app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});

// log the details
app.use(logger);
// Error middleware (after routes)
app.use(errorHandler);

export default app;

const express = require('express');
const authRouter = require('./routes/authRoutes');
const logger = require('./utils/logger');
const cookieParser = require('cookie-parser');
const errorRoute = require('./utils/errorRoute');

const app = express();

// Middleware to parse cookies
app.use(cookieParser());

// Middleware to parse JSON request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger middleware
app.use(logger);

// Routes
app.use('/api/v1/auth', authRouter);

// Middleware to handle 404 errors
app.use(errorRoute);

module.exports = app;

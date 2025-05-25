// Centralized error handling middleware
export const errorHandler = (err, req, res, next) => {
  // If response status code is 200, override to 500 (server error)
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    message: err.message,   // Send error message
    // Show stack trace only in non-production environments
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

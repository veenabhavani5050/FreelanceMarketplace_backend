// middleware/errorHandler.js
/* Centralised Express error handler */
const errorHandler = (err, _req, res, _next) => {
  /* Default to 500 unless set earlier in the pipeline */
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  /* Customise common Mongoose / JWT errors for clarity */
  if (err.name === 'CastError')    statusCode = 400;
  if (err.name === 'ValidationError') statusCode = 400;
  if (err.code === 11000)          statusCode = 409; // duplicate key
  if (err.name === 'JsonWebTokenError') statusCode = 401;
  if (err.name === 'TokenExpiredError') statusCode = 401;

  res.status(statusCode).json({
    message: err.message || 'Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

export { errorHandler };

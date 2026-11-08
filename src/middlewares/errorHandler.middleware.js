const errorHandler = (err, req, res, next) => {
  // Updated: Preserve status codes from Express body parsing and other middleware errors.
  const statusCode = err.statusCode || err.status || 500;
  // Updated: Keep unexpected server details in logs and avoid stack traces for routine client errors.
  if (statusCode >= 500) console.error(err.stack || err);
  const message = err.isOperational ? err.message : "Internal server error";
  res.status(statusCode).json({
    success: false,
    message,
  });
};
module.exports = errorHandler;

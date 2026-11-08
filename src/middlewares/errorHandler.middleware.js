const errorHandler = (err, req, res, next) => {
  console.error(err.message); // for the developer not in post man

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "internal server error ",
  });
};
module.exports = errorHandler;

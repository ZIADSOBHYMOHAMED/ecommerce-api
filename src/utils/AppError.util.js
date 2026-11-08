class AppError extends Error {
  constructor(message, statuscode) {
    super(message);
    // Updated: Use the property name read by the centralized handler so expected errors keep their HTTP status.
    this.statusCode = statuscode;
    this.isOperational = true;
  }
}
module.exports = AppError;

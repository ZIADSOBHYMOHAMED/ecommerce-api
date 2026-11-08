class AppError extends Error {
  constructor(message, statuscode) {
    super(message);
    this.statuscode = statuscode;
    this.isOperational = true;
  }
}
module.exports = AppError;

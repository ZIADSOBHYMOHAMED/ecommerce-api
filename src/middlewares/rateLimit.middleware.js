const { rateLimit } = require("express-rate-limit");
const AppError = require("../utils/AppError.util");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(
      new AppError(
        "too many requestes from this api please try again later ",
        429,
      ),
    );
  },
});

module.exports = limiter;

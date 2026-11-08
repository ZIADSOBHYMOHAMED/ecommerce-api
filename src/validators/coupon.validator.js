const { body, param } = require("express-validator");

exports.createCouponValidator = [
  body("code")
    .trim()
    .notEmpty()
    .withMessage("code is requried ")
    .isLength({ min: 6, max: 50 })
    .withMessage("please enter a valied code form 6 to 50 characters"),

  body("discount_type")
    .trim()
    .notEmpty()
    .withMessage("discount type is requried ")
    .isIn(["percentage", "fixed"])
    .withMessage("please enter a valied discounttype only  : fixed or percentage ")
  ,

  body("discount_value")
    .notEmpty()
    .withMessage("discount value is required ")
    .isFloat({ gt: 0 })
    .withMessage("discount value must be positive "),

  body("valid_until")
    .notEmpty()
    .withMessage("valid until is a required field")
    .isISO8601()
    .withMessage(" in vlied  date please enter a valied one it must be ISO 8601 "),
];
exports.updateCouponValidator = [
  param("id").isInt({ gt: 0 }).withMessage("id cant be negative or zero "),

  body("code")
    .optional()
    .notEmpty()
    .withMessage("coupon code is required")
    .trim()
    .isLength({ min: 6, max: 50 })
    .withMessage("please enter a valied code form 6 to 50 characters"),

  body("discount_type")
    .optional()
    .trim()
    .isIn(["percentage", "fixed"])
    .withMessage("please enter a valied discounttype only  : fixed or percentage "),

  body("discount_value")
    .optional()
    .isFloat({ gt: 0 })
    .withMessage("discount value must be positive "),

  body("valid_until")
    .optional()
    .isISO8601()
    .withMessage(" in vlied  date please enter a valied one IT MUST BE ISO 8601  "),
];
exports.idParamValidator = [
  param("id").isInt({ gt: 0 }).withMessage("id cant be negative or zero "),
];

const { body } = require("express-validator");

exports.registerValidator = [
  body("first_name")
    .trim()
    .notEmpty()
    .withMessage("First name is required")
    .isLength({ min: 3, max: 100 })
    .withMessage("First name must be between 3 and 100 characters"),

  body("last_name")
    .trim()
    .notEmpty()
    .withMessage("Last name is required")
    .isLength({ min: 3, max: 100 })
    .withMessage("Last name must be between 3 and 100 characters"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please write a valid email address")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),

  body("phone")
    .optional()
    .trim()
    .isMobilePhone("ar-EG")
    .withMessage("Please provide a valid Egyptian phone number"),
];

exports.loginValidator = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please write a valid email address")
    .normalizeEmail(),

  body("password").notEmpty().withMessage("Password is required"),
];

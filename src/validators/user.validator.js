const { body } = require("express-validator");

exports.updateUserAccountValidator = [
  body("first_name")
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage("first name must be between 3 and 100 characters"),
  body("last_name")
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage("Last name must be between 3 and 100 characters"),
  body("phone")
    .optional()
    .trim()
    .isMobilePhone("ar-EG")
    .withMessage("enter avalied egyption phone number"),
];

const { body, param } = require("express-validator");

exports.createAddressValidator = [
  body("user_id")
    .trim()
    .notEmpty()
    .withMessage("user id is required")
    .isInt({ gt: 0 })
    .withMessage("user id cant be negative or 0 "),
  body("city")
    .trim()
    .notEmpty()
    .withMessage("city id is required")
    .isLength({ min: 3, max: 100 })
    .withMessage("please enter a valied city between 3 and 100 character  "),
  body("street")
    .trim()
    .notEmpty()
    .withMessage("street id is required")
    .isLength({ min: 3, max: 255 })
    .withMessage("please enter a valied street between 3 and 255 character  "),
  body("country")
    .trim()
    .notEmpty()
    .withMessage("country id is required")
    .isLength({ min: 3, max: 100 })
    .withMessage("please enter a valied city between 3 and 100 character  "),
];
exports.updateAddressValidator = [
  body("user_id")
    .trim()
    .notEmpty()
    .withMessage("user id is required")
    .isInt({ gt: 0 })
    .withMessage("user id cant be negative or 0 "),
  body("city")
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage("please enter a valied city between 3 and 100 character  "),
  body("street")
    .optional()
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage("please enter a valied street between 3 and 255 character  "),
  body("country")
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage("please enter a valied city between 3 and 100 character  "),
];

exports.provideIdValidator = [
  param("id").trim().isInt({ gt: 0 }).withMessage("id cant be negative or 0"),
];

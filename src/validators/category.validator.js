const { body, param } = require("express-validator");
const slugify = require("slugify");

exports.createCategoryValidator = [
  body("category_name")
    .notEmpty()
    .withMessage("Category name is required")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Category name must be between 2 and 100 characters")
    .customSanitizer((value, { req }) => {
      req.body.slug = slugify(value, { lower: true, strict: true });
      return value;
    }),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters"),
];

exports.updateCategoryValidator = [
  param("id")
    .isInt({ gt: 0 })
    .withMessage("Invalid category ID format"),

  body("category_name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Category name must be between 2 and 100 characters")
    .customSanitizer((value, { req }) => {
      if (value) {
        req.body.slug = slugify(value, { lower: true, strict: true });
      }
      return value;
    }),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters"),
];

exports.categoryIdValidator = [
  param("id")
    .isInt({ gt: 0 })
    .withMessage("Invalid category ID format"),
];
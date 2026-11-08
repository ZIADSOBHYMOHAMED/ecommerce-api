const { body, param } = require("express-validator");
const slugify = require("slugify");

exports.createProductValidator = [
  body("category_id")
    .notEmpty()
    .withMessage("Category ID is required")
    .isInt({ gt: 0 })
    .withMessage("Category ID must be a positive integer"),

  body("title")
    .notEmpty()
    .withMessage("Product title is required")
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage("Title must be between 3 and 255 characters")
    .customSanitizer((value, { req }) => {
      if (value) {
        req.body.slug = slugify(value, { lower: true, strict: true });
      }
      return value;
    }),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage("Description cannot exceed 2000 characters"),

  body("price")
    .notEmpty()
    .withMessage("Price is required")
    .isFloat({ gt: 0 })
    .withMessage("Price must be a number greater than 0"),

  body("stock")
    .notEmpty()
    .withMessage("Stock is required")
    .isInt({ min: 0 })
    .withMessage("Stock must be an integer greater than or equal to 0"),
];

exports.updateProductValidator = [
  param("id").isInt({ gt: 0 }).withMessage("Invalid product ID format"),

  body("category_id")
    .optional()
    .isInt({ gt: 0 })
    .withMessage("Category ID must be a positive integer"),

  body("title")
    .optional()
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage("Title must be between 3 and 255 characters")
    .customSanitizer((value, { req }) => {
      if (value) {
        req.body.slug = slugify(value, { lower: true, strict: true });
      }
      return value;
    }),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage("Description cannot exceed 2000 characters"),

  body("price")
    .optional()
    .isFloat({ gt: 0 })
    .withMessage("Price must be a number greater than 0"),

  body("stock")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Stock must be an integer greater than or equal to 0"),
];

exports.productIdValidator = [
  param("id")
    .isInt({ gt: 0 })
    .withMessage("Invalid product ID. ID must be a positive integer"),
];

const { param, body } = require("express-validator");

exports.addProductToCartValidator = [
  body("product_id")
    .notEmpty()
    .withMessage("product_id is required")
    .isInt({ gt: 0 })
    .withMessage("product_id must be a positive integer"),

  body("quantity")
    .notEmpty()
    .withMessage("quantity is required")
    .isInt({ gt: 0 })
    .withMessage("quantity must be greater than 0"),
];

exports.updateCartProductValidator = [
  param("product_id")
    .notEmpty()
    .withMessage("product_id is required")
    .isInt({ gt: 0 })
    .withMessage("product_id must be a positive integer"),

  body("quantity")
    .notEmpty()
    .withMessage("quantity is required")
    .isInt({ gt: 0 })
    .withMessage("quantity must be greater than 0"),
];

exports.removeProductFromCartValidator = [
  param("product_id")
    .notEmpty()
    .withMessage("product_id is required")
    .isInt({ gt: 0 })
    .withMessage("product_id must be a positive integer"),
];

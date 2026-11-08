const { body, param } = require("express-validator");

exports.createOrderValidator = [
  body("address_id")
    .notEmpty()
    .withMessage("address_id is required")
    .bail() 
    .isInt({ gt: 0 })
    .withMessage("address_id must be a positive integer")
    .toInt(),
];


exports.updateOrderValidator = [
  param("id")
    .notEmpty()
    .withMessage("order id is required")
    .bail()
    .isInt({ gt: 0 })
    .withMessage("order id must be a positive integer")
    .toInt(),

  body("address_id")
    .notEmpty()
    .withMessage("address_id is required to update the order")
    .bail()
    .isInt({ gt: 0 })
    .withMessage("address_id must be a positive integer")
    .toInt(),
];

exports.idParamValidator = [
  param("id")
    .notEmpty()
    .withMessage("id parameter is required")
    .bail()
    .isInt({ gt: 0 })
    .withMessage("id must be a positive integer")
    .toInt(),
];

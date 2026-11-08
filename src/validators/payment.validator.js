const { body, param } = require("express-validator");

const createPaymentValidator = [
  body("order_id")
    .exists()
    .withMessage("order_id is required")
    .bail()
    .isInt({ min: 1 })
    .withMessage("order_id must be a positive integer"),

  body("payment_method")
    .exists()
    .withMessage("payment_method is required")
    .bail()
    .trim()
    .isIn(["cash", "card", "stripe", "paypal"])
    .withMessage("Invalid payment method"),
];

const paymentIdValidator = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("Payment ID must be a positive integer"),
];

const orderIdValidator = [
  param("orderId")
    .isInt({ min: 1 })
    .withMessage("Order ID must be a positive integer"),
];

const updatePaymentStatusValidator = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("Payment ID must be a positive integer"),

  body("payment_status")
    .exists()
    .withMessage("payment_status is required")
    .bail()
    .trim()
    .isIn(["completed", "failed", "refunded"])
    .withMessage("Invalid payment status"),
];

module.exports = {
  createPaymentValidator,
  paymentIdValidator,
  orderIdValidator,
  updatePaymentStatusValidator,
};

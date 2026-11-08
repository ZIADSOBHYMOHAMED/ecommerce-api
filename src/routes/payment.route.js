const express = require("express");

const paymentController = require("../controllers/payment.controller");

const {
  createPaymentValidator,
  paymentIdValidator,
  orderIdValidator,
  updatePaymentStatusValidator,
} = require("../validators/payment.validator");

// Updated: Use the authentication and authorization middleware already used by the other routes.
const protect = require("../middlewares/protect.middleware");
const requireRole = require("../middlewares/authorization.middleware");
const validation = require("../middlewares/validation.middleware");

const router = express.Router();

router.use(protect);

router.post("/", createPaymentValidator, validation, paymentController.createPayment);

router.get("/my-payments", paymentController.getMyPayments);

router.get(
  "/order/:orderId",
  orderIdValidator,
  validation,
  paymentController.getPaymentByOrderId,
);

router.get("/:id", paymentIdValidator, validation, paymentController.getPaymentById);

router.patch(
  "/:id/status",
  requireRole("admin"),
  updatePaymentStatusValidator,
  validation,
  paymentController.updatePaymentStatus,
);

module.exports = router;

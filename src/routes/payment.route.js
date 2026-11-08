const express = require("express");

const paymentController = require("../controllers/payment.controller");

const {
  createPaymentValidator,
  paymentIdValidator,
  orderIdValidator,
  updatePaymentStatusValidator,
} = require("../validators/payment.validator");

const protect = require("../middlewares/auth.middleware");

const requireRole = require("../middlewares/role.middleware");

const router = express.Router();

router.use(protect);

router.post("/", createPaymentValidator, paymentController.createPayment);

router.get("/my-payments", paymentController.getMyPayments);

router.get(
  "/order/:orderId",
  orderIdValidator,
  paymentController.getPaymentByOrderId,
);

router.get("/:id", paymentIdValidator, paymentController.getPaymentById);

router.patch(
  "/:id/status",
  requireRole("admin"),
  updatePaymentStatusValidator,
  paymentController.updatePaymentStatus,
);

module.exports = router;

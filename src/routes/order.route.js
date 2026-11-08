const express = require("express");
const router = express.Router();

const {
  createOrder,
  getOrder,
  updateOrder,
  deleteOrder,
} = require("../controllers/order.controller");

const protect = require("../middlewares/protect.middleware");
const authorization = require("../middlewares/authorization.middleware");
const validation = require("../middlewares/validation.middleware");

const {
  createOrderValidator,
  updateOrderValidator,
  idParamValidator,
} = require("../validators/order.validator");

router.use(protect);

router.post(
  "/",
  authorization("customer"),
  createOrderValidator,
  validation,
  createOrder,
);

router.get("/:id", idParamValidator, validation, getOrder);

router.patch(
  "/:id",
  authorization("customer"),
  updateOrderValidator,
  validation,
  updateOrder,
);

router.delete(
  "/:id",
  authorization("admin"),
  idParamValidator,
  validation,
  deleteOrder,
);

module.exports = router;

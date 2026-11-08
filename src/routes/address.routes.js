const express = require("express");
const router = express.Router();

const {
  createAddress,
  getAddress,
  updateAddress,
  deleteAddress,
} = require("../controllers/address.controller");
const {
  createAddressValidator,
  updateAddressValidator,
  provideIdValidator,
} = require("../validators/address.validator");

const validatorMiddleware = require("../middlewares/validation.middleware");
const protect = require("../middlewares/protect.middleware");
const authorization = require("../middlewares/authorization.middleware");

router.get(
  "/:id",
  protect,
  authorization("admin", "customer"),
  provideIdValidator,
  validatorMiddleware,
  getAddress,
);

router.post(
  "/",
  protect,
  authorization("admin", "customer"),
  createAddressValidator,
  validatorMiddleware,
  createAddress,
);

router.patch(
  "/:id",
  protect,
  authorization("admin", "customer"),
  updateAddressValidator,
  validatorMiddleware,
  updateAddress,
);
router.delete(
  "/:id",
  protect,
  authorization("admin", "customer"),
  provideIdValidator,
  validatorMiddleware,
  deleteAddress,
);

module.exports= router

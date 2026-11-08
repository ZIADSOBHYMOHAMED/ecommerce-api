const express = require("express");
const router = express.Router();

const {
  createCoupon,
  getCouponById,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
} = require("../controllers/coupon.controller");

const {
  createCouponValidator,
  updateCouponValidator,
  idParamValidator,
} = require("../validators/coupon.validator");

const protect = require("../middlewares/protect.middleware");
const authorization = require("../middlewares/authorization.middleware");
const validation = require("../middlewares/validation.middleware");

router.use(protect, authorization("admin"));
router.post("/", createCouponValidator, validation, createCoupon);
router
  .route("/:id")
  .get(idParamValidator, validation, getCouponById)
  .patch(updateCouponValidator, validation, updateCoupon)
  .delete(idParamValidator, validation, deleteCoupon);

router.post("/:id/validate", idParamValidator, validation, validateCoupon);

module.exports = router;

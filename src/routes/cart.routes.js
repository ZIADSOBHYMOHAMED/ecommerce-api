const express = require("express");
const router = express.Router();

const {
  getCart,
  addProductToCart,
  updateCartProduct,
  removeProductFromCart,
  clearCart,
} = require("../controllers/cart.controller");
const {
  addProductToCartValidator,
  updateCartProductValidator,
  removeProductFromCartValidator,
} = require("../validators/cart.validator");

const validatorMiddleware = require("../middlewares/validation.middleware");
const protect = require("../middlewares/protect.middleware");
const authorization = require("../middlewares/authorization.middleware");

router.use(protect, authorization("admin", "customer"));
router.route("/").get(getCart).delete(clearCart);
router.post(
  "/",
  addProductToCartValidator,
  validatorMiddleware,
  addProductToCart,
);
router
  .route("/:product_id")
  .patch(updateCartProductValidator, validatorMiddleware, updateCartProduct)
  .delete(
    removeProductFromCartValidator,
    validatorMiddleware,
    removeProductFromCart,
  );
module.exports = router;

const express = require("express");
const router = express.Router();

const {
  createProduct,
  getProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/product.controller");

const {
  createProductValidator,
  updateProductValidator,
  productIdValidator,
} = require("../validators/product.validator");

const validatorMiddleware = require("../middlewares/validation.middleware");
const protect = require("../middlewares/protect.middleware");
const authorization = require("../middlewares/authorization.middleware");

router.get("/:id", productIdValidator, validatorMiddleware, getProduct);

router.use(protect, authorization("admin"));

router.post("/", createProductValidator, validatorMiddleware, createProduct);

router
  .route("/:id")
  .patch(updateProductValidator, validatorMiddleware, updateProduct)
  .delete(productIdValidator, validatorMiddleware, deleteProduct);

  module.exports = router
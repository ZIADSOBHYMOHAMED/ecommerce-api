const express = require("express");
const router = express.Router();

const {
  createCategory,
  getAllCategories,
  getCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/category.controller");

const {
  createCategoryValidator,
  updateCategoryValidator,
  categoryIdValidator,
} = require("../validators/category.validator");

const validatorMiddleware = require("../middlewares/validation.middleware");
const protect = require("../middlewares/protect.middleware");
const authorization = require("../middlewares/authorization.middleware");

router.get("/:id", categoryIdValidator, validatorMiddleware, getCategory);

router.use(protect, authorization("admin"));

router.post("/", createCategoryValidator, validatorMiddleware, createCategory);

router
  .route("/:id")
  .patch(updateCategoryValidator, validatorMiddleware, updateCategory)
  .delete(categoryIdValidator, validatorMiddleware, deleteCategory);

module.exports = router;

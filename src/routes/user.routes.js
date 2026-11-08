const express = require("express");
const router = express.Router();

const protect = require("../middlewares/protect.middleware");
const authorization = require("../middlewares/authorization.middleware");
const validatorMiddleware = require("../middlewares/validation.middleware");

const {
  getUserAccount,
  updateUserAccount,
  deleteUserAccount,
} = require("../controllers/user.controller");

const { updateUserAccountValidator } = require("../validators/user.validator");

router.use(protect);

router
  .route("/me")
  .get(authorization("customer"), getUserAccount)
  .patch(authorization("customer"),updateUserAccountValidator, validatorMiddleware, updateUserAccount)
  .delete(authorization("customer"), deleteUserAccount);

module.exports = router;

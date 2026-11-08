const express = require("express")

const router = express.Router()

const protect = require("../middlewares/protect.middleware")
const authorization=require("../middlewares/authorization.middleware")
const validatorMiddleware = require("../middlewares/validation.middleware")

const {register,login,logout}= require("../controllers/auth.controller")

const {registerValidator,loginValidator} = require("../validators/auth.validator")

router.post("/register",registerValidator,validatorMiddleware,register)
router.post("/login",loginValidator,validatorMiddleware,login)
router.post("/logout",protect,logout)

module.exports= router

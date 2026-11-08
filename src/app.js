const express = require("express");
const app = express();

const authRouter = require("./routes/auth.routes");
const userRouter = require("./routes/user.routes");
const categoryRouter = require("./routes/category.routes");
const productRouter = require("./routes/product.routes");
const addressRouter = require("./routes/address.routes");
const cartRouter = require("./routes/cart.routes");
const orderRouter = require("./routes/order.route");
const couponRouter = require("./routes/coupon.routes");
const paymentRouter=require("./routes/payment.route")

const errorHandler = require("./middlewares/errorHandler.middleware");
const limiter = require("./middlewares/rateLimit.middleware");
app.use(express.json());

//limiter 15 min per 100 req
app.use(limiter);

//routes connnection
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/categories", categoryRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/addresses", addressRouter);
app.use("/api/v1/carts", cartRouter);
app.use("/api/v1/orders", orderRouter);
app.use("/api/v1/coupons", couponRouter);
app.use("/api/v1/payments",paymentRouter);

//apperror handler
app.use(errorHandler);
module.exports = app;

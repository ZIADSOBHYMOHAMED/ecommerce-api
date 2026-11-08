const paymentRepository = require("../repositories/payment.repository");

const AppError = require("../utils/AppError.util");

const catchAsync = require("../utils/catchAsync.util");

const createPayment = catchAsync(async (req, res, next) => {
  const { order_id, payment_method } = req.body;

  const userId = req.user.id;

  try {
    const payment = await paymentRepository.createPayment({
      orderId: order_id,
      userId,
      paymentMethod: payment_method,
    });

    if (!payment) {
      const existingPayment =
        await paymentRepository.getPaymentByOrderId(order_id);

      if (existingPayment) {
        return next(new AppError("This order already has a payment", 409));
      }

      return next(
        new AppError(
          "Order not found, does not belong to you, or is not eligible for payment",
          400,
        ),
      );
    }

    return res.status(201).json({
      status: "success",
      data: {
        payment,
      },
    });
  } catch (error) {
    if (
      error.code === "23505" &&
      error.constraint === "payments_order_id_key"
    ) {
      return next(new AppError("This order already has a payment", 409));
    }

    return next(error);
  }
});

const getPaymentById = catchAsync(async (req, res, next) => {
  const paymentId = req.params.id;
  const userId = req.user.id;

  const payment = await paymentRepository.getUserPaymentById(paymentId, userId);

  if (!payment) {
    return next(new AppError("Payment not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      payment,
    },
  });
});

const getPaymentByOrderId = catchAsync(async (req, res, next) => {
  const orderId = req.params.orderId;
  const userId = req.user.id;

  const payment = await paymentRepository.getPaymentByOrderId(orderId, userId);

  if (!payment) {
    return next(new AppError("Payment not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      payment,
    },
  });
});

const getMyPayments = catchAsync(async (req, res) => {
  const userId = req.user.id;

  const payments = await paymentRepository.getUserPayments(userId);

  res.status(200).json({
    status: "success",
    results: payments.length,
    data: {
      payments,
    },
  });
});

const updatePaymentStatus = catchAsync(async (req, res, next) => {
  const paymentId = req.params.id;

  const { payment_status } = req.body;

  const payment = await paymentRepository.updatePaymentStatus(
    paymentId,
    payment_status,
  );

  if (!payment) {
    const existingPayment = await paymentRepository.getPaymentById(paymentId);

    if (!existingPayment) {
      return next(new AppError("Payment not found", 404));
    }

    return next(
      new AppError(
        `Invalid payment status transition: ${existingPayment.payment_status} → ${payment_status}`,
        409,
      ),
    );
  }

  res.status(200).json({
    status: "success",
    data: {
      payment,
    },
  });
});

module.exports = {
  createPayment,
  getPaymentById,
  getPaymentByOrderId,
  getMyPayments,
  updatePaymentStatus,
};

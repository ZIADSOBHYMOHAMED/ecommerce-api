const AppError = require("../utils/AppError.util");
const catchAsync = require("../utils/catchAsync.util");
const OrderRepository = require("../repositories/order.repository");
const AddressRepository = require("../repositories/address.repository");
const CartRepository = require("../repositories/cart.repository");

exports.createOrder = catchAsync(async (req, res, next) => {
  const { address_id } = req.body;
  const user_id = req.user.id;

  const address = await AddressRepository.findAddressByIdAndUserId(
    address_id,
    user_id,
  );
  if (!address) {
    return next(
      new AppError("Address not found or does not belong to this user", 404),
    );
  }

  // Updated: Check that the customer has cart lines before starting order creation.
  const cartItems = await CartRepository.findCartItemsByUserId(user_id);
  if (cartItems.length === 0) {
    return next(new AppError("Your cart is empty", 400));
  }

  const initialStatus = "pending";

  const order = await OrderRepository.createOrder({
    userId: user_id,
    addressId: address_id,
    status: initialStatus,
  });

  // Added: Handle a cart consumed by another checkout after the initial empty-cart check.
  if (!order) {
    return next(new AppError("Your cart is empty", 400));
  }

  res.status(201).json({
    success: true,
    message: "Order created successfully",
    data: {
      order,
    },
  });
});

exports.getOrder = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const user_id = req.user.id;

  const order = await OrderRepository.findOrderByIdAndUserId(id, user_id);
  if (!order) {
    return next(new AppError("Order not found or access denied", 404));
  }

  res.status(200).json({
    success: true,
    message: "Order fetched successfully",
    data: {
      order,
    },
  });
});

exports.updateOrder = catchAsync(async (req, res, next) => {
  const { address_id } = req.body;
  const { id } = req.params;
  const user_id = req.user.id;

  const existingOrder = await OrderRepository.findOrderByIdAndUserId(
    id,
    user_id,
  );
  if (!existingOrder) {
    return next(new AppError("Order not found or access denied", 404));
  }

  if (existingOrder.status !== "pending") {
    return next(
      new AppError(
        "Cannot update order that is already being processed or shipped",
        400,
      ),
    );
  }

  const newAddress = await AddressRepository.findAddressByIdAndUserId(
    address_id,
    user_id,
  );
  if (!newAddress) {
    return next(
      new AppError("New address not found or does not belong to user", 404),
    );
  }

  const updatedOrder = await OrderRepository.updateOrdersByIdAndAddressId(
    id,
    address_id,
    user_id,
  );

  // Added: Report a concurrent status/ownership change instead of claiming the update succeeded.
  if (!updatedOrder) {
    return next(new AppError("Order could not be updated", 409));
  }

  res.status(200).json({
    success: true,
    message: "Order address updated successfully",
    data: {
      order: updatedOrder,
    },
  });
});

exports.deleteOrder = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const user_id = req.user.id;

  const order = await OrderRepository.findOrderByIdAndUserId(id, user_id);
  if (!order) {
    return next(new AppError("Order not found or access denied", 404));
  }

  if (order.status !== "pending") {
    return next(
      new AppError(
        "Cannot cancel an order that is already being processed or shipped",
        400,
      ),
    );
  }

  await OrderRepository.deleteOrderById(id);

  res.status(200).json({
    success: true,
    message: "Order cancelled successfully",
  });
});

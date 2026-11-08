const AppError = require("../utils/AppError.util");
const catchAsync = require("../utils/catchAsync.util");

const CartRepository = require("../repositories/cart.repository");

exports.getCart = catchAsync(async (req, res, next) => {
  const user_id = req.user.id;

  const cart = await CartRepository.findCartByUserId(user_id);

  if (!cart) {
    return next(new AppError("Cart not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Cart fetched successfully",
    data: {
      cart,
    },
  });
});

exports.addProductToCart = catchAsync(async (req, res, next) => {
  const user_id = req.user.id;

  const { product_id, quantity } = req.body;

  const cart = await CartRepository.findCartByUserId(user_id);

  if (!cart) {
    return next(new AppError("Cart not found", 404));
  }

  const product = await CartRepository.findActiveProductById(product_id);

  if (!product) {
    // Updated: The current products schema has no inactive state to report.
    return next(new AppError("Product not found", 404));
  }

  // Updated: The repository returns the cart primary key as cart_id.
  const cartProduct = await CartRepository.addProductToCart(
    cart.cart_id,
    product_id,
    quantity,
  );

  res.status(200).json({
    success: true,
    message: "Product added to cart successfully",
    data: {
      product: cartProduct,
    },
  });
});

exports.updateCartProduct = catchAsync(async (req, res, next) => {
  const user_id = req.user.id;

  const { product_id } = req.params;
  const { quantity } = req.body;

  const cart = await CartRepository.findCartByUserId(user_id);

  if (!cart) {
    return next(new AppError("Cart not found", 404));
  }

  // Updated: Use the cart ID field returned by findCartByUserId.
  const updatedProduct = await CartRepository.updateProductQuantity(
    cart.cart_id,
    product_id,
    quantity,
  );

  if (!updatedProduct) {
    return next(new AppError("Product not found in cart", 404));
  }

  res.status(200).json({
    success: true,
    message: "Cart product updated successfully",
    data: {
      product: updatedProduct,
    },
  });
});

exports.removeProductFromCart = catchAsync(async (req, res, next) => {
  const user_id = req.user.id;

  const { product_id } = req.params;

  const cart = await CartRepository.findCartByUserId(user_id);

  if (!cart) {
    return next(new AppError("Cart not found", 404));
  }

  // Updated: Use the cart ID field returned by findCartByUserId.
  const isDeleted = await CartRepository.deleteProductFromCart(
    cart.cart_id,
    product_id,
  );

  if (!isDeleted) {
    return next(
      new AppError("Product not found in cart or already removed", 404),
    );
  }

  res.status(200).json({
    success: true,
    message: "Product removed from cart successfully",
  });
});

exports.clearCart = catchAsync(async (req, res, next) => {
  const user_id = req.user.id;

  const cart = await CartRepository.findCartByUserId(user_id);

  if (!cart) {
    return next(new AppError("Cart not found", 404));
  }

  // Updated: Use the cart ID field returned by findCartByUserId.
  await CartRepository.clearCartByCartId(cart.cart_id);

  res.status(200).json({
    success: true,
    message: "Cart cleared successfully",
  });
});

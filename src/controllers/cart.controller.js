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
    return next(new AppError("Product not found or inactive", 404));
  }

  const cartProduct = await CartRepository.addProductToCart(
    cart.id,
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

  const updatedProduct = await CartRepository.updateProductQuantity(
    cart.id,
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

  const isDeleted = await CartRepository.deleteProductFromCart(
    cart.id,
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

  await CartRepository.clearCartByCartId(cart.id);

  res.status(200).json({
    success: true,
    message: "Cart cleared successfully",
  });
});

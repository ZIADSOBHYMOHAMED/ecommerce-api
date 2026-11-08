const AppError = require("../utils/AppError.util");
const catchAsync = require("../utils/catchAsync.util");
const ProductRepository = require("../repositories/product.repository");

exports.createProduct = catchAsync(async (req, res, next) => {
  const { category_id, title, description, price, stock, slug } = req.body;

  const existingProduct = await ProductRepository.findProductByCategoryAndTitle(
    category_id,
    title,
  );

  if (existingProduct) {
    return next(new AppError("Product already exists in this category", 409));
  }

  const product = await ProductRepository.createProduct({
    category_id,
    title,
    description,
    price,
    stock,
    slug,
  });

  res.status(201).json({
    success: true,
    message: "Product created successfully",
    data: {
      product,
    },
  });
});

exports.getProduct = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const product = await ProductRepository.findProductById(id);

  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Product retrieved successfully",
    data: {
      product,
    },
  });
});

exports.updateProduct = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const { category_id, title, description, price, stock, slug } = req.body;

  const updatedData = {};

  if (category_id !== undefined) {
    updatedData.category_id = category_id;
  }

  if (title !== undefined) {
    updatedData.title = title;
  }

  if (description !== undefined) {
    updatedData.description = description;
  }

  if (price !== undefined) {
    updatedData.price = price;
  }

  if (stock !== undefined) {
    updatedData.stock = stock;
  }

  if (slug !== undefined) {
    updatedData.slug = slug;
  }

  if (Object.keys(updatedData).length === 0) {
    return next(new AppError("Please provide fields to update", 400));
  }

  const product = await ProductRepository.updateProductById(id, updatedData);

  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Product updated successfully",
    data: {
      product,
    },
  });
});

exports.deleteProduct = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const deletedProduct = await ProductRepository.deleteProductById(id);

  if (!deletedProduct) {
    return next(new AppError("Product not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Product deleted successfully",
    data: {
      product: deletedProduct,
    },
  });
});

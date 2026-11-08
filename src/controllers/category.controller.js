const AppError = require("../utils/AppError.util");
const catchAsync = require("../utils/catchAsync.util");
const CategoryRepository = require("../repositories/category.repository");

exports.createCategory = catchAsync(async (req, res, next) => {
  const { category_name, description, slug } = req.body;

  const categoryExisting =
    await CategoryRepository.findCategoryByName(category_name);
  if (categoryExisting) {
    return next(new AppError("Category already exists", 400));
  }

  const category = await CategoryRepository.createCategory({
    category_name,
    slug,
    description,
  });

  res.status(201).json({
    success: true,
    message: "Category created successfully",
    data: { category },
  });
});

exports.getCategory = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const category = await CategoryRepository.findCategoryById(id);
  if (!category) {
    return next(new AppError("Category not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Category retrieved successfully",
    data: { category },
  });
});

exports.updateCategory = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { category_name, description, slug } = req.body;

  // Updated: Reject only an empty patch; optional fields can be updated independently.
  if (category_name === undefined && description === undefined && slug === undefined)
    return next(new AppError("please provide field to update", 400));

  const updatedData = {};
  if (category_name !== undefined) updatedData.category_name = category_name;
  if (description !== undefined) updatedData.description = description;
  if (slug !== undefined) updatedData.slug = slug;

  if (Object.keys(updatedData).length === 0) {
    return next(new AppError("Please provide fields to update", 400));
  }

  const category = await CategoryRepository.updateCategoryById(id, updatedData);
  if (!category) {
    return next(new AppError("Category not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Category updated successfully",
    data: { category },
  });
});

exports.deleteCategory = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const deletedCount = await CategoryRepository.deleteCategoryById(id);
  if (deletedCount === 0) {
    return next(new AppError("Category not found or already deleted", 404));
  }

  res.status(200).json({
    success: true,
    message: "Category deleted successfully",
  });
});

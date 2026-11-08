const AppError = require("../utils/AppError.util");
const catchAsync = require("../utils/catchAsync.util");
const UserRepository = require("../repositories/user.repository");

exports.getUserAccount = catchAsync(async (req, res, next) => {
  const user = await UserRepository.findUserById(req.user.id);
  if (!user) return next(new AppError("user not found", 404));

  res.status(200).json({
    success: true,
    message: "user data retervied successfully",
    data: {
      user,
    },
  });
});
exports.updateUserAccount = catchAsync(async (req, res, next) => {
  const { first_name, last_name, phone } = req.body;

  const updatedData = {};

  if (first_name !== undefined) {
    updatedData.first_name = first_name;
  }
  if (last_name !== undefined) {
    updatedData.last_name = last_name;
  }
  if (phone !== undefined) {
    updatedData.phone = phone;
  }

  const updatedUser = await UserRepository.updateUserById(
    req.user.id,
    updatedData,
  );
  if (!updatedUser) return next(new AppError("user not found", 404));

  return res.status(200).json({
    success: true,
    message: "user data are updated successfully",
    data: {
      updatedUser,
    },
  });
});
exports.deleteUserAccount = catchAsync(async (req, res, next) => {
  const user = await UserRepository.findUserById(req.user.id);
  if (!user) return next(new AppError("user is already not exist ", 404));

  await UserRepository.deleteUserById(req.user.id);

  res.status(200).json({
    success: true,
    message: "user deleted successfully",
  });
});

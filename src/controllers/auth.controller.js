const catchAsync = require("../utils/catchAsync.util");
const UserRepository = require("../repositories/user.repository");
const { hashPassword, comparePassword } = require("../utils/password.util");
const { generateToken } = require("../utils/jwt.util");
const AppError = require("../utils/AppError.util");

exports.register = catchAsync(async (req, res, next) => {
  const { first_name, last_name, email, password, phone } = req.body;

  const existingUser = await UserRepository.findUserByEmail(email);
  if (existingUser) {
    return next(new AppError("Email is already registered", 400));
  }

  const passwordHash = await hashPassword(password);

  const user = await UserRepository.createUser({
    first_name,
    last_name,
    email,
    passwordHash,
    phone,
  });

  res.status(201).json({
    status: "success",
    message: "User registered successfully",
    data: {
      user,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }

  const user = await UserRepository.findUserByEmail(email);
  if (!user) {
    return next(new AppError("Invalid email or password", 401));
  }

  const isPasswordValid = await comparePassword(password, user.password_hash);
  if (!isPasswordValid) {
    return next(new AppError("Invalid email or password", 401));
  }

  const token = generateToken({ id: user.id, role: user.role });

  delete user.password_hash;

  res.status(200).json({
    status: "success",
    message: "Logged in successfully",
    token,
    data: {
      user,
    },
  });
});

exports.logout = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: "success",
    message: "Logged out successfully",
  });
});

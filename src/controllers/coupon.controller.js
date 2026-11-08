const AppError = require("../utils/AppError.util");
const catchAsync = require("../utils/catchAsync.util");
const CouponRepository = require("../repositories/coupon.repository");

exports.createCoupon = catchAsync(async (req, res, next) => {
  const { discount_type, discount_value, valid_until } = req.body;
  // Updated: Normalize the request code without reassigning a const binding.
  const code = req.body.code.trim().toUpperCase();

  const valiedUntilDate = new Date(valid_until);

  // Added: Reject invalid timestamps as well as dates that have already passed.
  if (Number.isNaN(valiedUntilDate.getTime()) || valiedUntilDate <= new Date())
    return next(
      new AppError(
        "in valied  valied_until  date its old  itmust be in the future !",
        400,
      ),
    );

  if (discount_type === "percentage" && discount_value > 100) {
    return next(new AppError("parcentage discount cannot exced 100", 400));
  }
  try {
    const coupon = await CouponRepository.createCoupon({
      code: code,
      discountType: discount_type,
      discountValue: discount_value,
      validUntil: valid_until,
    });

    res.status(201).json({
      success: true,
      message: "coupon created successfully",
      data: {
        coupon,
      },
    });
  } catch (error) {
    // Updated: Compare the PostgreSQL error code so unrelated failures remain server errors.
    if (error.code === "23505") {
      return next(new AppError("coupon code alreasy existis", 409)); //conflict for duplicate a unique value
    }
    throw error;
  }
});
exports.getCouponById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const coupon = await CouponRepository.findCouponById(id);
  if (!coupon) return next(new AppError("coupon not found ", 404));

  res.status(200).json({
    success: true,
    message: "coupon retrened successfully",
    data: {
      coupon,
    },
  });
});
exports.updateCoupon = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const { code, discount_type, discount_value, valid_until } = req.body;

  const coupon = await CouponRepository.findCouponById(id);

  if (!coupon) {
    return next(new AppError("coupon not found", 404));
  }

  const updatedData = {};

  if (code !== undefined) {
    updatedData.code = code.trim().toUpperCase();
  }

  if (discount_type !== undefined) {
    updatedData.discount_type = discount_type;
  }

  if (discount_value !== undefined) {
    updatedData.discount_value = discount_value;
  }

  if (valid_until !== undefined) {
    updatedData.valid_until = valid_until;
  }

  if (Object.keys(updatedData).length === 0) {
    return next(new AppError("no fields provided for update", 400));
  }

  const finalDiscountType = updatedData.discount_type ?? coupon.discount_type;

  const finalDiscountValue =
    updatedData.discount_value ?? coupon.discount_value;

  const finalValidUntil = updatedData.valid_until ?? coupon.valid_until;

  if (Number(finalDiscountValue) <= 0) {
    return next(new AppError("discount value must be greater than 0", 400));
  }

  if (finalDiscountType === "percentage" && Number(finalDiscountValue) > 100) {
    return next(new AppError("percentage discount cannot exceed 100", 400));
  }

  if (new Date(finalValidUntil) <= new Date()) {
    return next(new AppError("valid_until must be a future date", 400));
  }

  try {
    const updatedCoupon = await CouponRepository.updateCoupon(id, updatedData);

    if (!updatedCoupon) {
      return next(new AppError("coupon not found", 404));
    }

    res.status(200).json({
      success: true,
      message: "coupon updated successfully",
      data: {
        coupon: updatedCoupon,
      },
    });
  } catch (error) {
    if (error.code === "23505") {
      return next(new AppError("coupon code already exists", 409));
    }

    throw error;
  }
});
exports.deleteCoupon = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const coupon = await CouponRepository.deleteCouponById(id);
  if (!coupon) return next(new AppError("coupon not found or ", 404));

  res.status(200).json({
    success: true,
    message: "coupon deleted successfully",
  });
});
exports.validateCoupon = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const coupon = await CouponRepository.findCouponById(id);

  if (!coupon) return next(new AppError("coupon not found ", 404));

  if (!coupon.is_active) return next(new AppError("coupon is not active", 400));

  if (new Date(coupon.valid_until) <= new Date())
    return next(new AppError("coupon is not valid now", 400));

  res.status(200).json({
    success: true,
    message: "coupon is valied",
    data: {
      valied: true,
      coupon,
    },
  });
});

const AppError = require("../utils/AppError.util");
const catchAsync = require("../utils/catchAsync.util");
const AddressRepository = require("../repositories/address.repository");

exports.createAddress = catchAsync(async (req, res, next) => {
  const user_id = req.user.id;

  const { city, street, country } = req.body;

  const address = await AddressRepository.createAddress(
    user_id,
    city,
    street,
    country,
  );

  res.status(201).json({
    success: true,
    message: "Address created successfully",
    data: {
      address,
    },
  });
});

exports.getAddress = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const user_id = req.user.id;

  const address = await AddressRepository.findAddressByIdAndUserId(id, user_id);

  if (!address) {
    return next(new AppError("Address not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Address returned successfully",
    data: {
      address,
    },
  });
});

exports.updateAddress = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const user_id = req.user.id;

  const { city, street, country } = req.body;

  const updatedData = {};

  if (city !== undefined) updatedData.city = city;
  if (street !== undefined) updatedData.street = street;
  if (country !== undefined) updatedData.country = country;

  if (Object.keys(updatedData).length === 0) {
    return next(new AppError("Please provide data to update", 400));
  }

  const address = await AddressRepository.updateAddressByIdAndUserId(
    id,
    user_id,
    updatedData,
  );

  if (!address) {
    return next(new AppError("Address not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Address updated successfully",
    data: {
      address,
    },
  });
});

exports.deleteAddress = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const user_id = req.user.id;

  const deletedCount = await AddressRepository.deleteAddressByIdAndUserId(
    id,
    user_id,
  );

  if (deletedCount === 0) {
    return next(new AppError("Address not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Address deleted successfully",
  });
});

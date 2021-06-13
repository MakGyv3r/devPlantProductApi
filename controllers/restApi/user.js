const ErrorResponse = require('../../utils/errorResponse');
const asyncHandler = require('../../middleware/async');
const User = require('../../models/User');
const PlantProduct = require('../../models/PlantProduct');


// @desc    get all users
// @route   Get /api/v1/auth/users
// @access  privete/admin

exports.getUsers = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    get single users
// @route   Get /api/v1/auth/users/:id
// @access  privete/admin

exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Create users
// @route   POST /api/v1/auth/users
// @access  Privete/admin

exports.createUser = asyncHandler(async (req, res, next) => {
  const user = await User.create(req.body);

  res.status(201).json({
    success: true,
    data: user,
  });
});

// @desc    update users
// @route   PUT /api/v1/auth/users/:id
// @access  Privete/admin

exports.updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: ture,
  });

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Delete users
// @route   DELETE /api/v1/auth/users/:id
// @access  Privete/admin

exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);
  res.status(200).json({
    success: true,
    data: {},
  });
});


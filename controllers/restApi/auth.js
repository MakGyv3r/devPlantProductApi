const crypto = require('crypto');
const ErrorResponse = require('../../utils/errorResponse');
const asyncHandler = require('../../middleware/async');
// const sendEmail = require('../utils/sendEmail');
const User = require('../../models/User');
const Hub = require('../../models/Hub');

// @desc    Register user
// @route   post /api/v1/auth/register
// @access  public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, hubCatNumber } = req.body;
  console.log(hubCatNumber);
  const hub = await Hub.findOne({
    hubCatNumber: hubCatNumber,
  });
  console.log(hub._id);
  // console.log(!plantiplant.Online_status);
  //console.log(plantiplant.userId === undefined);

  if (
    !hub ||
    !(hub.userId === undefined)
  ) {
    console.log("Must provide valid Hub's catloge number ");
    return res
      .status(402)
      .send({ error: "Must provide valid Hub's catloge number " });
  }

  // creat user
  const user = await User.create({
    name,
    email,
    password,
    hubId: hub._id,
  });

  // saving the new user in getaway
  hub.userId = user._id;
  await hub.save();

  sendTokenResponse(user, 200, res);
});

// @desc    Login user
// @route   post /api/v1/auth/login
// @access  public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // validate email and password
  if (!email || !password) {
    return next(new ErrorResponse('Please provide an email and password', 400));
  }

  //  chack for user
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  //  check if password  matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  sendTokenResponse(user, 200, res);
});

// @desc    get user
// @route   get /api/v1/auth/me
// @access  privet
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    update user details
// @route   PUT /api/v1/auth/updatedetails
// @access  privet
exports.updateDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
  };

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: user,
  });
});



// @desc    update user password
// @route   PUT /api/v1/auth/updatepassword
// @access  privet
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  // check current password
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse('Password is incorrect', 401));
  }
  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc    forgot password
// @route   POST /api/v1/auth/forgotpassword
// @access  public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new ErrorResponse('There is no user with this email', 404));
  }

  // get reset token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  // creat reset url
  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/auth/resetpassword/${resetToken}`;
  res.status(200).json({
    success: true,
    data: user,
  });

  const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;
  try {
    await sendEmail({
      email: user.email,
      subject: 'password reset token',
      message,
    });
    res.status(200).json({ success: true, data: 'Email sent' });
  } catch (error) {
    console.log(err);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorResponse('Email could not be sent', 500));
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Reaset Password
// @route   PUT /api/v1/auth/resetpassword/:resettoken
// @access  public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // get ha
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordexpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorResponse('Invalid token', 400));
  }

  // set new
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();
  sendTokenResponse(user, 200, res);
});

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    token,
  });
};

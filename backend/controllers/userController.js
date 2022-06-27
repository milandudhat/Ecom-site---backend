const ErrorHander = require('../utils/errorhander')
const catchAsyncError = require('../middleware/catchAsyncError')
// const sendToken = require('../utils/jwtToken')
const sendEmail = require('../utils/sendEmail')

const User = require('../models/useModel');
const crypto = require('crypto')
const { default: isURL } = require('validator/lib/isurl');
const sendToken = require('../utils/jwtToken');
const { use } = require('express/lib/application');


exports.registerUser = catchAsyncError(async (req, res, next) => {
  const { name, email, password } = req.body;

  const user = await User.create({
    name, email, password,
    avatar: {
      public_id: "this is simple Id",
      url: "profilepicurl"
    }
  })

  sendToken(user, 201, res)
})

exports.loginUser = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;


  // checking if user has given passowrd and email both
  if (!email || !password) {
    return next(new ErrorHander("please Enter Email & password", 400));

  }
  const user = await User.findOne({ email: email }).select("+password");
  if (!user) {
    return next(new ErrorHander("invalid Email & Password", 401))

  }
  const isPasswordMatched = user.comparePassword(password);
  if (!isPasswordMatched) {
    return next(new ErrorHander("invalid Email & Password", 401))

  }
  sendToken(user, 200, res)

})


// Logout user
exports.logout = catchAsyncError(async (req, res, next) => {

  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  })


  res.status(200).json({
    success: true,
    meassage: "Logged Out"
  })
})




// Forgot Password
exports.forgotPassword = catchAsyncError(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorHander("User not found", 404));
  }

  // Get ResetPassword Token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  const resetPasswordUrl = `${req.protocol}://${req.get(
    "host"
  )}api/v1/password/reset/${resetToken}`;

  const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\nIf you have not requested this email then, please ignore it.`;

  try {
    await sendEmail({
      email: user.email,
      subject: `Ecommerce Password Recovery`,
      message,
    });

    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} successfully`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorHander(error.message, 500));
  }
});



// Reset Password

exports.resetPassword = catchAsyncError(async (req, res, next) => {


  // Creating token hash

  const resetPasswordToken = crypto
    .createHash("sha256").update(req.params.token).digest("hex");


  const user = await User.findOne({
    resetPasswordToken: resetPasswordToken, resetPasswordExpire: { $gt: Date.now() }
  })

  if (!user) {
    return next(new ErrorHander("Reset PasswordToken is invalid  or has been expired", 404));
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHander("Password Does not match with ConfirmPassword", 404));

  }

  use.password = req.body.password;

  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save({ validateBeforeSave: false });

  sendToken(user , 200 , res)


})





// Get User Detail
exports.getUserDetails = catchAsyncError( async( req , res , next)=>{
  const user  = await User.findOne(req.body.id)


  res.status(200).json({
    success:true ,
    user
  })
})


// update user Password
exports.updatePassword = catchAsyncError( async( req , res , next)=>{
  const user  = await User.findOne(req.body.id).select('+password')

  const isPasswordMatched = user.comparePassword(req.body.oldPassword);
  if (!isPasswordMatched) {
    return next(new ErrorHander("Old Password is incorrect", 400))

  }

  if(req.body.newPassword !== req.body.confirmPassword) {
    return next(new ErrorHander("Password Does not match with ConfirmPassword", 404));

  }


  user.password = req.body.newPassword

  await user.save()
  sendToken(user , 200 , res)
})


// update user Profile
exports.updateProfile = catchAsyncError(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
  };
  const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
  });
});




// Get All Users(admin)

exports.getAllUser = catchAsyncError( async (req , res , next) =>{
  const users = await User.find();


  res.status(200).json({
    success:true ,
    users ,
  })
})


// Get Single User (admin)

exports.getSingleUser = catchAsyncError( async (req , res ,next) =>{
  const user = await User.findById(req.params.id)

  if(!user){
    return next( new ErrorHander(` User does not exist with Id : ${req.params.id}`))
  }


  res.status(200).json({
    success : true ,
    user
  })
})


// update user Role ---- Admin
exports.updateUserRole = catchAsyncError(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    role : req.body.role
  };
  const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
  });
});


// delete user ---- Admin
exports.deleteUser = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if(!user){
    return next(new ErrorHander(` User Does not exist with ${req.params.id}`))
  }

  await user.remove()

  res.status(200).json({
    success: true,
  });
});






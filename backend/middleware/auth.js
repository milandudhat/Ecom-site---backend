const ErrorHander = require("../utils/errorhander");
const catchAsyncError = require("./catchAsyncError");
const jwt = require("jsonwebtoken")
const User = require('../models/useModel')


exports.isAuthenticatedUser = catchAsyncError(async (req, res, next) => {
    const { token } = req.cookies;
    // console.log(token);
    if (!token) {
        return next(new ErrorHander("Please Login to access this product", 404))
    }
    const decodeData = jwt.verify(token, process.env.JWT_SECRET)
    req.user = await User.findById(decodeData.id)
    next()
})


exports.authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new ErrorHander(
                `Role : ${req.user.role} is not alloed to access this resouce`, 403
            )
            )}

        next();
    }
}

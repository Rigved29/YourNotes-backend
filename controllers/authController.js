const crypto = require("crypto");
const { promisify } = require("util");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const AppError = require("./../utils/appError");
const sendEmail = require("./../utils/email");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signUp = async (req, res, next) => {
  try {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      passwordChangedAt: req.body.passwordChangedAt,
      role: req.body.role,
    });

    const token = signToken(newUser._id);

    res.status(201).json({
      status: "success",
      token,
      data: {
        user: newUser,
      },
    });

    console.log(req.body);
  } catch (err) {
    console.log(err);
  }
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError("please provide email and password", 400));
  }

  // 2) Check if user exists && password is correct
  const user = await User.findOne({ email }).select("+password");
  const correct = await user.correctPassword(password, user.password);

  if (!user || !correct) {
    return next(new AppError("Incorrect email or password", 401));
  }

  //3) If everything ok, send token to client

  const token = signToken(user._id);

  res.status(200).json({
    status: "success",
    token,
  });
};

exports.protect = async (req, res, next) => {
  try {
    //1) getting token and check it it's there
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(
        new AppError("You are not logged in! Please log in to get access", 401)
      );
    }

    //2) verification token

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    console.log(decoded);

    //3) check if user still exits
    const freshUser = await User.findById(decoded.id);

    console.log(freshUser, "👉🏻freshuser");

    if (!freshUser) {
      return next(
        new AppError(
          "The user belonging to this user does no longer exist",
          401
        )
      );
    }

    //4) Check if user changed password after the token was issued

    if (!freshUser.changedPasswordAfter(decoded.iat)) {
      new AppError("User recently changed password! Please log in again.", 401);
    }

    //Grant Access to protected route
    req.user = freshUser;
    next();
  } catch (err) {
    console.log(err, "error 🔥");

    if (err.name === "JsonWebTokenError") {
      return new AppError("Invalid signature", 401);
    }
  }
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("you do not have permission to perform this action", 403)
      );
    }

    next();
  };
};

exports.forgetPassword = async (req, res, next) => {
  // 1) Get user based on posted email

  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError("There is no user with this email address", 404));
  }

  //2) Generate the random reset token

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) send it to user's email

  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetUrl}.\nIf you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset token (valid for 10min)",
      message,
    });

    res.status(200).json({
      status: "success",
      message: "Token sent to email!",
    });
  } catch (err) {
    user.createPasswordResetToken = undefined;
    user.passwordResetExpiers = undefined;

    await user.save({ validateBeforeSave: false });

    return next(
      new AppError("There was an error sending the email.Try again later!"),
      500
    );
  }
};

exports.resetPasssword = async (req, res, next) => {
  //1) get user based on token

  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  //2) If token has not expired and there is user , set the new password

  if (!user) {
    return next(new AppError("Token is invalid or has expired", 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  const token = signToken(user._id);

  res.status(200).json({
    status: "success",
    token,
  });

  //3) update changedPasswordAt property for the user

  //4) Log the user in, send JWT
};

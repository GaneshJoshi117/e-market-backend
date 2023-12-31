const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');

const cookieOptions = {
	expires: new Date(
		Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
	),
	httpOnly: true,
};

const signToken = (id) => {
	return jwt.sign(
		{
			id,
		},
		process.env.JWT_SECRET,
		{
			expiresIn: process.env.JWT_COOKIE_EXPIRES_IN,
		}
	);
};

const createSendToken = (user, statusCode, res) => {
	const token = signToken(user._id);
	if (process.env.NODE_ENV === 'production') {
		cookieOptions.secure = true;
	}
	res.cookie('jwt', token, cookieOptions);
	//remove password from the output
	user.password = undefined;
	res.status(statusCode).json({
		status: 'success',
		token,
		data: {
			user,
		},
	});
};

exports.signup = catchAsync(async function (req, res, next) {
	const newUser = await User.create({
		name: req.body.name,
		email: req.body.email,
		password: req.body.password,
		passwordConfirm: req.body.passwordConfirm,
		passwordChangedAt: req.body.passwordChangedAt,
		role: req.body.role,
	});

	createSendToken(newUser, 201, res);
});

const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, 'Please enter a name'],
	},
	email: {
		type: String,
		required: [true, 'Please enter an email'],
		unique: true,
		lowercase: true,
		validate: [validator.isEmail, 'Please enter a valid email'],
	},
	photo: {
		type: String,
		default: 'default.jpg',
	},
	role: {
		type: String,
		enum: ['admin', 'staff', 'buyer', 'seller'],
		default: 'buyer',
	},
	password: {
		type: String,
		required: [true, 'Please enter a password'],
		minLength: 8,
		select: false,
	},
	passwordConfirm: {
		type: String,
		required: [true, 'Please enter a password'],
		validate: {
			validator: function (value) {
				return value === this.password;
			},
			message: 'Passwords does not match',
		},
	},
	passwordChangedAt: {
		type: Date,
	},
	passwordResetToken: String,
	passwordResetExpires: Date,
	active: {
		type: Boolean,
		default: true,
		select: false,
	},
});

userSchema.pre('save', async function (next) {
	if (!this.isModified('password')) return next();
	this.password = await bcrypt.hash(this.password, 12);
	this.passwordConfirm = undefined;
	next();
});

userSchema.pre('save', function (next) {
	if (!this.isModified('password') || this.isNew) return next();
	this.passwordChangedAt = Date.now() - 1000;
	next();
});

////////////////////////////////
//to find users with active status set to true
userSchema.pre(/^find/, function (next) {
	//this points to the current query
	this.find({ active: { $ne: false } });
	next();
});

//Instance method
userSchema.methods.correctPassword = async function (
	candidatePassword,
	userPassword
) {
	return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changePasswordAfter = async function (JWTTimestamp) {
	if (this.passwordChangedAt) {
		const changedTime = parseInt(this.passwordChangedAt.getTime() / 1000);
		return JWTTimestamp < changedTime;
	}
	return false;
};

userSchema.methods.createPasswordResetToken = function () {
	const resetToken = crypto.randomBytes(32).toString('hex');
	this.passwordResetToken = crypto
		.createHash('sha256')
		.update(resetToken)
		.digest('hex');
	this.passwordResetExpires = Date.now() + 600000;

	return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;

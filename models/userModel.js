const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please tell us your name!']
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email!']
    },
    photo: {
        type: String,
        default: 'default.jpg'
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    hourlyPrice: {
        type: Number,
        required: [true, 'Please provide your hourly price!']
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 8,
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password!'],
        validate: {
            // This is only on CREATE AND SAVE not UPDATE of findIdAndUpdate
            validator: function (passwordConfirm) {
                return passwordConfirm === this.password;
            },
            message: 'Password doesn\'t confirm'
        }
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
    }
});

UserSchema.pre('save', function (next) {
    if (!this.isModified('password') || this.isNew) return next();
    this.pasmswordChangedAt = Date.now() - 1000;
    next();
});

UserSchema.pre('save', async function (next) {
    // Run this function if password was actually modified 
    if (!this.isModified('password')) return next();
    // Hash the password with cost of 12
    this.password = await bcrypt.hash(this.password, 12); // there is sync and asycn hash function, this is asycn

    //Delete passwordConfirm field
    this.passwordConfirm = undefined;
    next();
});

UserSchema.pre(/^find/, function (next) {
    this.find({ active: { $ne: false } });
    next();
});

// Instance method: method that is gonna be available on all documents
UserSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
}

UserSchema.methods.changePasswordAfter = function (JWTTimestamp) {
    if (this.pasmswordChangedAt) { // this keyword always points to the current document.
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10); // change from data to second to ms
        return JWTTimestamp < changedTimestamp; // 100 < 200 => false, password changed after token generated
    }
    return false; // By default the user didn't changed his password ever
}
UserSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken) // Encrypt generated token again to save it into DB.
        .digest('hex');
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // The token is vali for 10 min
    return resetToken;
}


const User = mongoose.model('User', UserSchema);
module.exports = User;
const fs = require('fs');
const multer = require('multer');
const Jimp = require("jimp");
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/AppError');
const factory = require('./handleFactory');
const User = require('./../models/userModel');
// const sharp = require('sharp');





// PHOTO MIDDLEWARE

const multerStorage = multer.memoryStorage();
// test if the uploaded file is an image.
const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image'))
        cb(null, true) // no error / true: it is an image
    else
        cb(new AppError('Not an image! Please upload only images.', 400), false) //  false: it is not an image    
}
// If there is no dest => the uploaded photo will store in the memory
const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});

// Multer middleware
exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = (req, res, next) => {
    if (!req.file) return next();
    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

    console.log('RESIZE: ', req.user);

    if (req.user.photo !== 'default.jpg') {
        // DELTEE THE PREVIOUS PHOTO
        const imagename = req.user.photo;
        if (imagename) {
            fs.unlink(`public/img/users/${imagename}`, (err) => {
                if (err) {
                    console.error(err);
                    return;
                }
                console.log('Old image file deleted successfully');
            });
        }
    }

    Jimp.read(req.file.buffer, (err, lenna) => {
        if (err) new AppError('Something went wrong with photo! Please try again.');
        lenna
            .resize(500, 500) // resize
            .quality(90) // set JPEG quality
            .rotate(0)
            .write(`public/img/users/${req.file.filename}`); // save
    });
    next();
};

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
};


exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
}

exports.getUser = factory.getOne(User);

exports.updateMe = catchAsync(async (req, res, next) => {
    // 1) Create error if user POSTs password data
    if (req.body.password || req.body.passwordConfirm) return next(new AppError('This route is not for password update. Please use /updateMyPassword', 400));
    if (req.body.active) return next(new AppError('This route is not for delete account. Please use /deleteMe', 400));

    // 2) Filtered out  unwanted field names that are not allowed to be updated such like role(a normal user can't changed his role ro admin)
    const filteredBody = filterObj(req.body, 'name', 'email'); // name and email are the fields can user update
    //add the photo property to the object that is going to be updated here (filteredBody) to update it into DB
    if (req.file) filteredBody.photo = req.file.filename;

    // 3) Update user document
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true, // this line will return the new updated obj again
        runValidators: true,
    });

    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser
        }
    });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
    const user = await User.findByIdAndUpdate(req.user.id, { active: false });
    res.status(204).json({
        status: 'success',
        data: null
    });
});
const User = require('./../models/userModel');
const factory = require('./handleFactory');


// With FACTORY
exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
exports.createUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet implemented'
    });
};
// Do NOT update password with this
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);

// MIDDLEWARE
// ++++++++++++++++++++   ME    ++++++++++++++++++++++++++
// exports.getMe = (req, res, next) => {
//     req.params.id = req.user.id;
//     next();
// }
// exports.updateMe = catchAsync(async (req, res, next) => {
//     // 1) Create error if user POSTs password data
//     if (req.body.password || req.body.passwordConfirm) return next(new AppError('This route is not for password update. Please use /updateMyPassword', 400));

//     // 2) Filtered out  unwanted field names that are not allowed to be updated such like role(a normal user can't changed his role ro admin)
//     const filteredBody = filterObj(req.body, 'name', 'email'); // name and email are the fields can user update
//     //add the photo property to the object that is going to be updated here (filteredBody) to update it into DB
//     if (req.file) filteredBody.photo = req.file.filename;

//     // 3) Update user document
//     const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
//         new: true, // this line will return the new updated obj again
//         runValidators: true,
//     });

//     res.status(200).json({
//         status: 'success',
//         data: {
//             user: updatedUser
//         }
//     });
// });

// exports.deleteMe = catchAsync(async (req, res, next) => {
//     const user = await User.findByIdAndUpdate(req.user.id, { active: false });
//     res.status(204).json({
//         status: 'success',
//         data: null
//     });
// });
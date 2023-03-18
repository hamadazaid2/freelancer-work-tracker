const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/AppError');
const APIFeatures = require('./../utils/apiFeatures');
const authController = require('./authenticationController');
const User = require('../models/userModel');


exports.getAll = Model => catchAsync(async (req, res, next) => {
    // To allow for nested GET reviews on tour (hack)
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    // EXECUTE QUERY
    const features = new APIFeatures(Model.find(filter), req.query) // Tour.find() => find all tours
        .filter()
        .sort()
        .limitFields()
        .paginate();
    // until here the query is setted 
    // const doc = await features.query.explain();
    const doc = await features.query; // here the setted query will exceute

    // SEND RESPONSE 
    res.json({
        status: 'OK',
        results: doc.length,
        data: {
            date: doc
        },
    });
})

exports.getOne = (Model, popOptions) => catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;
    if (!doc) {
        return next(new AppError('No document found with that ID', 404));
    }
    res.json({
        status: 'OK',
        data: {
            data: doc
        },
    });
})
exports.createOne = Model => catchAsync(async (req, res, next) => {

    const doc = await Model.create(req.body);
    if (req.body.password || req.body.password) {
        const user = await Model.findById(doc._id);
        if (!user) return next(new AppError('Something went wrong when user created!', 404));
        user.password = req.body.password;
        user.passwordConfirm = req.body.passwordConfirm;
        user.save();
    }
    res.status(201).json({
        status: 'success',
        data: {
            data: doc
        }
    });
});

exports.updateOne = Model => catchAsync(async (req, res, next) => {
    if (req.body.password || req.body.passwordConfirm) {
        // 1) Get user from DB
        const user = await User.findById(req.params.id).select('+password');
        if (!user) return next(new AppError('There is no user with that id!', 404));

        // 2) If so, update password
        user.password = req.body.password;
        user.passwordConfirm = req.body.passwordConfirm;
        await user.save();

        delete req.body.password;
        delete req.body.passwordConfirm;
    }

    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });
    if (!doc) {
        return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            data: doc
        }
    });
})

exports.deleteOne = Model => catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
        return next(new AppError('No document found with that ID', 404));
    }
    res.status(204).json({
        status: 'success',
    });
});

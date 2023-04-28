const Status = require('../models/statusModel');
const AppError = require('../utils/AppError');
const Project = require('./../models/projectModel');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handleFactory');

exports.getAll = catchAsync(async (req, res, next) => {
    const projects = await Project.find({ user: req.user._id });
    res.status(200).json({
        status: 'succss',
        data: {
            data: projects
        }
    });
});
exports.getProject = catchAsync(async (req, res, next) => {
    req.body.user = req.user
    console.log('here');
    const project = await Project.findById(req.params.id).where({ user: req.user._id });
    if (!project) return next(new AppError('No project found with that id!', 204));
    res.status(200).json({
        status: 'success',
        data: {
            data: project
        }
    });
})

exports.createProject = catchAsync(async (req, res, next) => {
    req.body.status = req.body.status ? req.status : await Status.findOne({ name: 'Done' });
    const newProject = await Project.create({
        ...req.body,
        user: req.user._id
    });
    res.status(201).json({
        status: 'success',
        data: {
            data: newProject
        }
    });
});


exports.updateProject = catchAsync(async (req, res, next) => {
    const project = await Project.findByIdAndUpdate(req.params.id, {
        // To doesn't allow user to update task to another user
        name: req.body.name,
        description: req.body.description,
        status: req.body.status,
        price: req.body.price,
        customer: req.body.customer,
        numberOfWorkingMinutes: req.body.numberOfWorkingMinutes
    }, {
        new: true
    }).where({ user: req.user._id });
    if (!project) return next(new AppError('No project with found that id!', 404))
    res.status(200).json({
        status: 'success',
        data: {
            data: project
        }
    });
})

exports.deleteProject = catchAsync(async (req, res, next) => {
    const project = await Project.findByIdAndDelete(req.params.id).where({ user: req.user._id });

    if (!project) return next(new AppError('No project found with that id!', 404));
    res.status(204).json({
        status: 'success'
    });
})
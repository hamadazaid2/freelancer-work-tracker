const Project = require('../models/projectModel');
const AppError = require('../utils/AppError');
const Task = require('./../models/taskModel');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handleFactory');

exports.checkNestedRoute = (req, res, next) => {
    if (req.user.role === 'admin') return next();
    // Check if the request is made through a nested route
    if (!req.params.projectId) return next(new AppError('You are not allowed to access this route!', 401));
    // Check if the request is made through a nested route
    if (!req.baseUrl.includes('/projects')) return next(new AppError('You are not allowed to access this route!', 401));
    // If he arrive here then he is a user not admin, and want to use nested route
    next();
}


exports.getAll = catchAsync(async (req, res, next) => {
    if (!req.baseUrl.includes('/projects')) {
        // NOT NESTED ROUTE!
        // The only one can use this route is ADMIN whos can SEE all tasks 
        const tasks = await Task.find(); // FIND ALL Tasks
        res.status(200).json({
            status: 'success',
            data: {
                data: tasks
            }
        });
    }

    // ELSE (User can access below code)
    // 1) Check if user pass project id in URL
    if (!req.params.projectId) return next(new AppError('Can\'t find project id!', 404))
    // 2) Check if the project belongs to user
    const project = await Project.findById(req.params.projectId);
    if ((project.user._id).toString() !== req.user.id) return next(new AppError('No project found with that id!', 404));
    const tasks = await Task.find({ project: req.params.projectId });

    res.status(200).json({
        status: 'success',
        data: {
            data: tasks
        }
    });
})

exports.getTask = catchAsync(async (req, res, next) => {
    // 1) Check if it is Not nested route (ADMIN)
    if (!req.baseUrl.includes('/projects')) {
        // NOT NESTED ROUTE!
        // The only one can use this route is ADMIN whos can SEE the task specified 
        // 1a) Check for task id in url
        if (!req.params.id) return next(new AppError('No task id in url!', 404)); // مش لازم لانه مكانش في معرف للمهمة بيدخل على روات كل المهام
        // 1b) Find task
        const tasks = await Task.findOne({ _id: req.params.id });
        if (!task) return next(new AppError('No task found with that id!', 404));
        // 1c) Return task in response
        res.status(200).json({
            status: 'success',
            data: {
                data: tasks
            }
        });
    }

    // 2) Check if user pass project id in URL
    if (!req.params.projectId) return next(new AppError('Can\'t find project id!', 404));
    if (!req.params.id) return next(new AppError('Can\'t find task id!', 404));
    // 3) Check if the project belongs to user
    const project = await Project.findById(req.params.projectId);
    if ((project.user._id).toString() !== req.user.id) return next(new AppError('No project found with that id!', 404));
    // 4) Return task belong to this project
    const task = await Task.findById(req.params.id).where({ project: req.params.projectId });
    // req.user.id: 6410c1f970e89998d36ef602
    // task.project.user: new ObjectId("6410c1f970e89998d36ef602")
    //task.project.user !== req.user.id => true (Because it check the datatype too)
    if (!task || (task.project.user != req.user.id)) return next(new AppError('No task belongs to this project with that id found!', 404));
    res.status(200).json({
        status: 'success',
        data: {
            data: task
        }
    });
})

exports.createTask = catchAsync(async (req, res, next) => {
    if (!req.baseUrl.includes('/projects')) {
        // NOT NESTED ROUTE!
        // The only one can use this route is ADMIN whos can SEE all tasks 
        // 1) Check if the project id sent by req.body is valid!
        const project = await Project.findById(req.body.project);
        if (!project) return next(new AppError('The project you want to add task to in not found!', 404));
        const task = await Task.create(req.body);
        res.status(201).json({
            status: 'success',
            data: {
                data: task
            }
        });
    }

    // 1) Check if user pass project id in URL
    if (!req.params.projectId) return next(new AppError('Can\'t find project id!', 404))
    // 2) Check if the project belongs to user
    const project = await Project.findById(req.params.projectId);
    if (((project.user._id)).toString() !== req.user.id) return next(new AppError('No project found with that id!', 404));
    // 3) Create Task for this project
    const newTask = await Task.create({
        ...req.body,
        project: req.params.projectId,
    });
    res.status(201).json({
        status: 'success',
        data: {
            data: newTask
        }
    });
})

exports.updateTask = catchAsync(async (req, res, next) => {
    if (!req.baseUrl.includes('/projects')) {
        // NOT NESTED ROUTE!
        // The only one can use this route is ADMIN whos can SEE all tasks 
        if (!req.params.id) return next(new AppError('No task id in url!', 404));
        // 1) Check if the task u want to update is valid
        let task = await Task.findById(req.params.id);
        if (!task) return next(new AppError('No task found with that id! ', 404));
        // 2) Check if want to update project of the task and check if it is valid
        if (req.body.project) {
            const project = await Project.findById(req.body.project);
            if (!project) return next(new AppError('The project you want to add task to in not found!', 404));
        }
        task = await Task.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        res.status(201).json({
            status: 'success',
            data: {
                data: task
            }
        });
    }

    // 1) Check if user pass project id in URL
    if (!req.params.projectId) return next(new AppError('Can\'t find project id!', 404));
    if (!req.params.id) return next(new AppError('Can\'t find task id!', 404));
    // 2) Check if the project belongs to user
    const project = await Project.findById(req.params.projectId);
    if ((project.user._id).toString() !== req.user.id) return next(new AppError('No project found with that id!', 404));

    // 3) Check if there is a task belongs to porject with that id
    let task = await Task.findOne({ _id: req.params.id, project: req.params.projectId });
    if (!task) return next(new AppError('No task found with that id!', 404));

    // 4) Check if the user want to update the project of task
    if (req.body.project) {
        console.log(req.body.project);
        const newProject = await Project.findById(req.body.project).where({ user: req.user.id });
        if (!newProject) return next(new AppError('The project you want to update task to is not found!', 404));
    }

    // 4) Update Task
    task = await Task.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    if (!task) return next(new AppError('No task belongs to this project with that id found!', 404));
    res.status(200).json({
        status: 'success',
        data: {
            data: task
        }
    });
})
exports.deleteTask = catchAsync(async (req, res, next) => {
    if (!req.baseUrl.includes('/projects')) {
        // NOT NESTED ROUTE!
        // The only one can use this route is ADMIN whos can SEE all tasks 
        if (!req.params.id) return next(new AppError('No task id in url!', 404));
        await Task.findByIdAndDelete(req.params.id);
        return res.status(204).json({
            status: 'success'
        });
    }
    // 1) Check if user pass project id in URL
    if (!req.params.projectId) return next(new AppError('Can\'t find project id!', 404));
    if (!req.params.id) return next(new AppError('Can\'t find task id!', 404));

    // 2) Check if the project belongs to user
    const project = await Project.findById(req.params.projectId);
    if ((project.user._id).toString() !== req.user.id) return next(new AppError('No project found with that id!', 404));
    // 3) Check if there is a task belongs to porject with that id
    let task = await Task.findOne({ _id: req.params.id, project: req.params.projectId });
    if (!task) return next(new AppError('No task found with that id!', 404));
    // 3) Delete Task
    task = await Task.findByIdAndDelete(req.params.id).where({ project: req.params.projectId });

    res.status(204).json({
        status: 'success'
    });
})
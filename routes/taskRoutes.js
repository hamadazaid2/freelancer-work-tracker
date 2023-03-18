const express = require('express');
const taskController = require('./../controllers/taskController');
const authController = require('./../controllers/authenticationController');

const router = express.Router({ mergeParams: true });

// /api/project/:projectId/task (Get all tasks for this project)
// /api/project/:projectId/task/:taskId (get/update/delete for this task in this project)

router.use(authController.protect, taskController.checkNestedRoute)

router
    .route('/')
    .get(taskController.getAll)
    .post(taskController.createTask);

router
    .route('/:id')
    .get(taskController.getTask)
    .patch(taskController.updateTask)
    .delete(taskController.deleteTask);

module.exports = router;
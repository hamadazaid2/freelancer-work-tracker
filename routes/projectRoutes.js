const express = require('express');
const projectController = require('./../controllers/projectController');
const authController = require('./../controllers/authenticationController')
const taskRoutes = require('./taskRoutes');



const router = express.Router();

router.use('/:projectId/tasks', taskRoutes);


router.use(authController.protect);

router
    .route('/')
    .get(projectController.getAll)
    .post(projectController.createProject);
router
    .route('/:id')
    .get(projectController.getProject)
    .patch(projectController.updateProject)
    .delete(projectController.deleteProject);

module.exports = router;
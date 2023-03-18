const express = require('express');

const userController = require('./../controllers/userController');
const authController = require('./../controllers/authenticationController');

const router = express.Router();

// auth routes
router.post('/signup', authController.signUp);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);


// Protect all routes after this middleware
// For the logged in user

// router.route('/me').get(userController.getMe, userController.getUser);
// router.patch('/updateMyPassword', authController.updatePassword);

// router.patch('/updateMe',
//     userController.uploadUserPhoto,
//     userController.resizeUserPhoto,
//     userController.updateMe); //uploadUserPhoto is a middleware
// router.delete('/deleteMe', userController.deleteMe);


router.use(authController.protect);

// --------------------------------------------
// Must be logged in and ADMIN
router.use(authController.restrictTo('admin'));

router
    .route('/')
    .get(userController.getAllUsers)
    .post(userController.createUser);
router
    .route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser);

module.exports = router;
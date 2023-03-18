const express = require('express');

const meController = require('../controllers/meController');
const authController = require('../controllers/authenticationController');

const router = express.Router();

// Protect all routes after this middleware
// For the logged in user
router.use(authController.protect);

router.get('/', meController.getMe, meController.getUser);
router.patch('/updateMyPassword', authController.updatePassword);

router.patch('/updateMe',
    meController.uploadUserPhoto,
    meController.resizeUserPhoto,
    meController.updateMe); //uploadUserPhoto is a middleware
router.delete('/deleteMe', meController.deleteMe);


module.exports = router;
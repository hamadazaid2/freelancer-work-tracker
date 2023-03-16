const express = require('express');
const Status = require('./../models/statusModel');

const router = express.Router();

router.post('/', async (req, res, next) => {
    const newStatus = await Status.create(req.body);
    res.status(201).json({
        status: 'success',
        data: {
            data: newStatus
        }
    });
});

module.exports = router;
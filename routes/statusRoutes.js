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

router.get('/', async (req, res, next) => {
    const statuses = await Status.find();
    res.status(200).json({
        status: 'success',
        data: {
            data: statuses
        }
    });
});

module.exports = router;
const mongoose = require('mongoose');

const statusSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'A status must have a name'],
            enum: {
                values: ['To Do', 'In Progress', 'QA', 'Done'],
                message: 'Status must be either \'To Do\', \'In Progress\', \'QA\' or \'Done\''
            }
        }
    }, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
}
);

const Status = mongoose.model('Status', statusSchema);
module.exports = Status;
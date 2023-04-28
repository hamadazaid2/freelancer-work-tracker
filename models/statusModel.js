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
        },
        color: {
            type: String,
            default: 'info',
            enum: {
                values: ['success', 'danger', 'warning', 'info'],
                message: 'Status color must be either \'success\', \'danger\', \'warning\' or \'info\''
            }
        }
    }, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
}
);

const Status = mongoose.model('Status', statusSchema);
module.exports = Status;
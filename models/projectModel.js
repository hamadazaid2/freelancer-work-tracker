
const mongoose = require('mongoose');



const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A project must have name'],
        unique: true,
        maxLength: [50, 'A project must have less than or equal than 50 characters'],
        minLength: [4, 'A project must have more than or equal than 5 characters'],
    },
    desciption: {
        type: String,
        required: [true, 'A project must have description']
    },
    numberOfWorkingMinutes: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['In Progress', 'Done'],
        default: 'Done'
    },
    price: Number,
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        // required: [true, 'Project must belong user']
    },
    customer: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'Customer'
        }
    ],
    startedAt: {
        type: Date,
        default: Date.now()
    },
    finishedAt: Date
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

projectSchema.virtual('workingHours').get(function () {
    return (this.numberOfWorkingMinutes / 60).toFixed(2);
});
const Project = mongoose.model('Project', projectSchema);
module.exports = Project;
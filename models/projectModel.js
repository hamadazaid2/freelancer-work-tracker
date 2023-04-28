
const mongoose = require('mongoose');



const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A project must have name'],
        unique: true,
        maxLength: [50, 'A project must have less than or equal than 50 characters'],
        minLength: [4, 'A project must have more than or equal than 5 characters'],
    },
    description: {
        type: String,
        required: [true, 'A project must have description']
    },
    numberOfWorkingMinutes: {
        type: Number,
        default: 0
    },
    status: {
        type: mongoose.Schema.ObjectId,
        ref: 'Status',
    },
    price: Number,
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Project must belong user']
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
projectSchema.pre(/^find/, function (next) {
    this.populate({ path: 'status', select: 'name color' });
    next();
});
projectSchema.pre('save', function (next) {
    this.populate({ path: 'status', select: 'name color' });
    next();
});
projectSchema.virtual('workingHours').get(function () {
    return (this.numberOfWorkingMinutes / 60).toFixed(2);
});
const Project = mongoose.model('Project', projectSchema);
module.exports = Project;
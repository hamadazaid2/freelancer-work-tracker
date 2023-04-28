const mongoose = require('mongoose');
const Project = require('./projectModel');
const User = require('./userModel');


const taskSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            unique: true,
            required: [true, 'A task must have a name']
        },
        description: {
            type: String,
            required: [true, 'A task must have a description']
        },
        priority: {
            type: Number,
            default: 2,
            min: [1, 'Priority must be more than or equal 1'],
            max: [5, 'Priority must be less than or equal 5']
        },
        expectedWorkingMinutes: {
            type: Number,
            required: [true, 'A task must have number of expected working minutes']
        },
        status: {
            type: String,
            enum: ['To Do', 'In Progress', 'QA', 'Done'],
            default: 'To Do'
        },
        project: {
            type: mongoose.Schema.ObjectId,
            ref: 'Project',
            required: [true, 'Task must have project']
        },
    });

taskSchema.pre(/^find/, function (next) {
    this.populate('project');
    next();
});

taskSchema.statics.checkUpdateProjectStatus = async function (projectId) {
    const projectNotDone = await Task.findOne({ project: projectId, status: { $in: ['To Do', 'In Progress', 'QA'] } });
    const pj = await Project.findByIdAndUpdate(
        projectId,
        { status: projectNotDone ? 'In Progress' : 'Done' },
        {
            new: true,
            runValidators: true
        }
    );
}

taskSchema.statics.checkUpdateProjectWorkingMinutesAndPrice = async function (projectId) {
    const aggregatedData = await Task.aggregate([
        {
            $match: { project: new mongoose.Types.ObjectId(projectId), status: 'Done' }
        },
        {
            $group: {
                _id: null,
                workingMinutes: { $sum: '$expectedWorkingMinutes' }
            }
        }
    ]);

    const project = await Project.findById(projectId);
    const { hourlyPrice } = await User.findById(project.user);

    const pj = await Project.findByIdAndUpdate(projectId, {
        numberOfWorkingMinutes: aggregatedData[0] ? aggregatedData[0].workingMinutes : 0,
        price: aggregatedData[0] ? ((aggregatedData[0].workingMinutes / 60) * hourlyPrice) : 0
    }, {
        new: true,
        runValidators: true
    });
}

taskSchema.statics.updateProject = function (projectId) {
    Task.checkUpdateProjectStatus(projectId);
    Task.checkUpdateProjectWorkingMinutesAndPrice(projectId);
}

// ---- 
taskSchema.post('save', function (doc) {
    Task.updateProject(this.project);
})


taskSchema.pre(/^findOneAnd/, async function (next) {
    // 1) Check if the opreation is Delete Or updated 
    if (this.op === 'findOneAndDelete') {
        this.deletedTask = await Task.findOne(this.getQuery());
        return next();
    }

    // 2) Check if the status of the updated task is updated
    // this._update: Object of the updated fields in query
    if (
        (
            (this._update.status || this._update.expectedWorkingMinutes) && !this._update.project
        )
        || (!this._update.status && !this._update.project && !this._update.expectedWorkingMinutes)
    )
        return next();

    // 3) Update projects status
    const taskBeforeUpdate = await Task.findOne(this.getQuery());

    // Else: Case1: Update status and project , Case2: Update project without status
    this.taskBeforeUpdate = taskBeforeUpdate;
    next();
});

taskSchema.post(/^findOneAnd/, function (doc) {
    // 1) Check if the operation is Update Or Delete
    if (this.op === 'findOneAndDelete') {
        Task.updateProject(this.deletedTask.project._id);
        return;
    }


    // 2) Check if the status and project is not updated then the project status won't be updated
    if (!this._update.$set.status && !this._update.$set.project && !this._update.$set.expectedWorkingMinutes) return;

    //3) If it's update then update the projects status

    // this: refers to query  -  doc: refers to the updated document 
    Task.updateProject(doc.project._id);
    if (this.taskBeforeUpdate) { // Update the previous project status
        Task.updateProject(this.taskBeforeUpdate.project._id);

    }
});

const Task = mongoose.model('Task', taskSchema);
module.exports = Task;
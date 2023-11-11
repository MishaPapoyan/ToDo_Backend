const {Schema, model} = require('mongoose')
const mongoose = require("mongoose");
const currentDate = new Date();
const hours = currentDate.getHours().toString().padStart(2, '0');
const minutes = currentDate.getMinutes().toString().padStart(2, '0');
const defaultDeadlineStart = `${hours}:${minutes}`;

const Task = new Schema({
    user:{type: mongoose.Schema.Types.ObjectId, required: true, unique: true},
    taskName: {type: String, required: true, unique:true},
    taskDescription: {type: String, required: true},
    deadlineStart: {type: String, required: true, default: defaultDeadlineStart },
    deadlineEnd: {type: String, required: true},
    priority: {type: String, required: true},
    idDone:{type: Boolean, required: true, default: false},

})

module.exports = model('Task', Task)

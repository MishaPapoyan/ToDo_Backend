const { Schema, model } = require('mongoose');

const Stats = new Schema({
    generalTaskCount: { type: Number },
    lateTaskCount: { type: Number },
    doneTaskCount: { type: Number },
    restCount: { type: Number }
});

module.exports = model('Stats', Stats);

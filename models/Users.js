const {Schema, model} = require('mongoose')


const Users = new Schema({
    username: {type: String, required: true},
    lastname: {type: String, required: true},
    password: {type: String, required: true},
    email: {type: String},
    age: {type: Number},
    profession: {type: String},
    gender: {type: String},
    roles: [{type: String, ref: 'Role'}]
})

module.exports = model('Users', Users)
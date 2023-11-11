const User = require('./models/Users')
const Role = require('./models/Role')
const Tasks = require('./models/Tasks')
const Stats = require('./models/Stats')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator')
const {secret} = require("./config")

const generateAccessToken = (id, roles) => {
    const payload = {
        id,
        roles
    }
    return jwt.sign(payload, secret, {expiresIn: "24h"} )
}



class authController {
    async registration(req, res) {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return res.status(400).json({message: "Ошибка при регистрации", errors})
            }
            const {username, lastname, email, age, profession, gender, password, repeatPassword} = req.body;
            const candidate = await User.findOne({email: email})
            if (candidate === true) {
                console.log(email)
                console.log(candidate)
                return res.status(400).json({message: "Пользователь с таким mail уже существует"})
            }
            const hashPassword = bcrypt.hashSync(password, 7);
            const userRole = await Role.findOne({value: "USER"})
            const user = new User({username, lastname, age, profession, email, password:hashPassword, gender,  roles: [userRole.value]})
            await user.save()
            return res.json({message: "Пользователь успешно зарегистрирован"})
        } catch (e) {
            console.log(e)
            res.status(400).json({message: 'Registration error'})
        }
    }

    async login(req, res) {
        try {
            const {username, password,lastname} = req.body
            console.log(username,password)
            const user = await User.findOne({username})

            if (!user) {
                return res.status(400).json({message: `Пользователь ${username} не найден`})
            }
            const validPassword = bcrypt.compareSync(password, user.password)
            if (!validPassword) {
                return res.status(400).json({message: `Введен неверный пароль`})
            }
            const token = generateAccessToken(user._id, user.roles)
            return res.json({token, user})
        } catch (e) {
            console.log(e)
            res.status(400).json({message: 'Login error'})
        }
    }

    async addTask(req, res) {
        try {
            const {user, taskName, taskDescription, deadlineStart, deadlineEnd, priority, isDone} = req.body;
            const hasThisTask = await Tasks.findOne({ taskName });

            if (hasThisTask) {
                return res.status(400).json({ message: "A task with this name already exists" });
            }


            const userRole = await Role.findOne({ value: "USER" });
            const task = new Tasks({user, taskName, priority, taskDescription, deadlineStart, deadlineEnd, roles: [userRole.value], isDone });
            const stats = new Stats({ generalTaskCount: 0, lateTaskCount: 0,doneTaskCount:0,restCount: 0});
            stats.generalTaskCount++;
            stats.restCount = stats.generalTaskCount - stats.lateTaskCount - stats.doneTaskCount
            await stats.save();
            await task.save();
            return res.json({ message: "Task has been successfully registered" });
        } catch (e) {
            console.log(e);
            res.status(400).json({ message: 'Task add: error' });
        }
    }


    async getAllTasks(req, res) {
        try {
            const { user_ID } = req.body;

            console.log("--------------------" + user_ID);

            // Use find instead of findOne to get all tasks related to the user ID
            const tasks = await Tasks.find({ user: user_ID });
            const currentUser = await User.find({ _id: user_ID }); //654ced8c68d89934d8caf57c
            console.log(currentUser)
            // Check if there are tasks for the given user
            if (!tasks || tasks.length === 0) {
                return res.json({ message: "No tasks found for the user" });
            }

            return res.json(tasks);
        } catch (e) {
            console.log(e);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    async getStats(req, res) {
        try {
            const { user_ID } = req.body;

            const tasks = await Tasks.find({ user: user_ID });
            const currentUser = await Stats.find();
            console.log(currentUser)
            // Check if there are tasks for the given user
            if (!tasks || tasks.length === 0) {
                return res.json({ message: "No tasks found for the user" });
            }

            return res.json(tasks);
        } catch (e) {
            console.log(e);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    async changeLateTaskCount(req, res){
        let stats = await Stats.findOne();
        if (!stats) {
            // If the Stats document doesn't exist, create one with generalTaskCount as 1
            stats = new Stats({ lateTaskCount: 1 });
        } else {
            // If the Stats document exists, increment generalTaskCount
            stats.lateTaskCount++;
        }
    }

    async changeRestTasksCount(req,res){
        let stats = await Stats.findOne();
        if(stats.generalTaskCount && stats.lateTaskCount){
            stats.restTaskCount++;
        }
    }

    async changeDoneTasksCount(req,res){
        let stats = await Stats.findOne();
        if(stats.doneTaskCount == null){
            stats = new Stats({ lateTaskCount: 1 });
        }
        else {
            stats.doneTaskCount ++;
        }
    }




    async get_current_user(req, res) {
        try {
            const { username } = req.body;
            const user = await User.findOne({ username });

            if (user) {
                res.json({ user })
            } else {
                return res.status(404).json({ message: 'User not found' });
            }
        } catch (e) {
            console.log(e);
            res.status(400).json({ message: 'Login error' });
        }
    }

    async getUsers(req, res) {
        try {
            const users = await User.find()
            res.json(users)
        } catch (e) {
            console.log(e)
        }
    }
    async save_data_in_server(req, res) {
        try {
            const requestData = req.body;
            const currentDate = Object.keys(requestData)[0];
            console.log(`Received data for date: ${currentDate}`);
            console.log('Data:', requestData[currentDate]);

            res.status(200).send('Data received successfully.');
        } catch (e) {
            console.log(e);
            res.status(400).json({ message: 'error' });
        }
    }


}

module.exports = new authController()

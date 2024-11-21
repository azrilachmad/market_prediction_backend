require('dotenv').config()
const user = require('../db/sqModels/user')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')


const generateToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRE_IN
    })
}

const signUp = async (req, res) => {
    const body = req.body;
    console.log(body);

    if (!['1', '2'].includes(body.userType)) {
        return res.status(400).json({
            status: 'Failed',
            message: "Invalid user type"
        })
    }

    if (body.password !== body.confirmPassword) return res.status(400).json({
        status: 'Failed',
        message: "Password does not match"
    })

    const newUser = await user.create({
        userType: body.userType,
        name: body.name,
        username: body.username,
        password: body.password,
        confirmPassword: body.confirmPassword
    });

    const result = newUser.toJSON()

    delete result.password
    delete result.deletedAt

    result.token = generateToken({

    })

    if (!result) {
        return res.status(400).json({
            status: 'Failed',
            message: 'Failed to create user'
        })
    }

    return res.status(201).json({
        status: 'Success',
        data: result,
    })
}


const signIn = async (req, res) => {
    const {username, password} = req.body

    if (!username || !password) {
        return req.status(400).json({
            status: 'Failed',
            message: 'Please enter a username and password'
        })
    }

    const result = await user.findOne({where: {username: username}})
    if(!result || !(await bcrypt.compare(password, result.password))) {
        return res.status(401).json({
            status: 'Failed',
            message: 'Invalid username or password'
        })
    }

    const token = generateToken({
        id: result.id
    })

    return res.json({
        status: 'Success',
        token,
    })
}

module.exports = { signUp, signIn }

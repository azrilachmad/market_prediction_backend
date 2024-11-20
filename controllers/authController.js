const user = require('../db/sqModels/user')

const signUp = async (req, res) => {
    const body = req.body;
    console.log(body);

    if (!['1', '2'].includes(body.userType)) {
        return res.status(400).json({
            status: 'Failed',
            message: "Invalid user type"
        })
    }

    const newUser = user.create({
        userType: body.userType,
        name: body.name,
        username: body.email,
        password: body.password,
    });

    if (!newUser) {
        return res.status(400).json({
            status: 'Failed',
            message: 'Failed to create user'
        })
    }

    return res.status(201).json({
        status: 'Success',
        data: newUser,
    })
}

const signIn = async (req, res) => {
    try {
        res.json({
            status: 'success',
            messagg: 'Sign in router are working'
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Internal Server Error" })
    }
}

module.exports = { signIn, signUp }

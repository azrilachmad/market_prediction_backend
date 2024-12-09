require('dotenv').config()
const user = require('../db/sqModels/user')
const catchAsync = require("../utils/catchAsync");
const AppError = require('../utils/appError')
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

const generateToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRE_IN
    })
}

const getAllUser = catchAsync(async (req, res, next) => {

    const pageAsNumber = parseInt(req.query.page) || 1;
    const limitAsNumber = parseInt(req.query.limit) || 10;
    const order = req.query.order;

    let page = 0;
    if (!Number.isNaN(pageAsNumber) && pageAsNumber > 0) {
        page = pageAsNumber;
    }

    let limit = 10;
    if (!Number.isNaN(limitAsNumber) && limitAsNumber > 0) {
        page = limitAsNumber;
    }

    const token = req.header('authorization');

    const userList = await user.findAll({ limit: limitAsNumber, offset: page === 1 ? 0 : (pageAsNumber - 1) * limitAsNumber, order: [['updatedAt', 'ASC']] })

    res.json({
        data: userList
    })
})

const getUser = catchAsync(async (req, res, next) => {

    const token = req.header('authorization');
    const cookie = token.replace('Bearer ', '')

    const claims = jwt.verify(cookie, process.env.JWT_SECRET_KEY)
    const id = claims.id

    if (!claims) {
        return next(new AppError('Unauthenticated', 401))
    }

    const userData = await user.findOne({ id: claims.id })

    const { password, createdAt, deletedAt, updatedAt, ...data } = await userData.toJSON()
    return res.json({
        data,
    })
})

const createUser = catchAsync(async (req, res, next) => {
    // Validation inside controller
    await body('userType')
        .notEmpty()
        .withMessage('Role is required')
        .run(req);

    await body('email')
        .notEmpty()
        .withMessage('Email is required')
        .bail()
        .isEmail()
        .withMessage('Invalid email address')
        .bail()
        .custom(async (value) => {
            if(value) {
                const userExist = await user.findOne({ where: { email: value } });
                if (userExist) {
                    throw new Error('Email already exists');
                }
            }
        })
        .run(req);

    await body('password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
        .run(req);

    await body('confirmPassword')
        .custom((value, { req }) => value === req.body.password)
        .withMessage('Passwords do not match')
        .run(req);

    await body('name')
        .notEmpty()
        .withMessage('Name is required')
        .run(req);

    // Check validation result after running all validators
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // Format errors into a single object
        const formattedErrors = errors.array().reduce((acc, error) => {
            acc[error.path] = error.msg; // Map field to message
            return acc;
        }, {});

        return res.status(400).json({
            status: 'Failed',
            errors: formattedErrors,
        });
    }

    const { userType, name, email, password } = req.body;

    const newUser = await user.create({
        userType,
        name,
        email,
        password,
    });

    if (!newUser) {
        throw new AppError('Failed to create the user', 400);
    }

    const result = newUser.toJSON();
    delete result.password;
    delete result.deletedAt;

    result.token = generateToken({ id: result.id });

    return res.status(201).json({
        status: 'Success',
        data: result,
    });
});



module.exports = { getUser, getAllUser, createUser }

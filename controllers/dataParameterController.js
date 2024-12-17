require('dotenv').config()
const dataParameter = require('../db/sqModels/dataParameter')
const catchAsync = require("../utils/catchAsync");
const AppError = require('../utils/appError')
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const bcrypt = require('bcrypt')


const generateToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRE_IN
    })
}

const getAllDataParameter = catchAsync(async (req, res, next) => {

    const pageAsNumber = parseInt(req.query.page) || 1;
    const limitAsNumber = parseInt(req.query.limit) || 10;
    const order = req.query.order || 'asc';
    sortBy = req.query.sortBy || 'updatedAt'

    let page = 0;
    if (!Number.isNaN(pageAsNumber) && pageAsNumber > 0) {
        page = pageAsNumber;
    }

    let limit = 10;
    if (!Number.isNaN(limitAsNumber) && limitAsNumber > 0) {
        page = limitAsNumber;
    }


    const dataParameterList = await dataParameter.findAndCountAll({ limit: limitAsNumber, offset: page === 1 ? 0 : (pageAsNumber - 1) * limitAsNumber, order: [[sortBy, order]] })

    res.json({
        data: dataParameterList.rows,
        error: false,
        message: "OK - The request was successfull",
        meta: {
            page: req.query.page,
            perPage: limit.toString(),
            total: dataParameterList.count,
            totalPages: Math.ceil(dataParameterList.count / limit)
        }
    })
})


const createDataParameter = catchAsync(async (req, res, next) => {
    // Validation inside controller
    await body('parameter')
        .notEmpty()
        .withMessage('Parameter is required')
        .run(req);

    await body('table_column')
        .notEmpty()
        .withMessage('Table Column is required')
        .run(req);

    await body('status')
        .notEmpty()
        .withMessage('Table Column is required')
        .isBoolean()
        .withMessage('Invalid value for Table Column')
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

    const { parameter, table_column, status } = req.body;

    const newDataParameter = await dataParameter.create({
        parameter,
        table_column,
        status,
    });

    if (!newDataParameter) {
        throw new AppError('Failed to create data parameter', 400);
    }

    const result = newDataParameter.toJSON();
    delete result.deletedAt;

    return res.status(201).json({
        status: 'Success',
        data: result,
    });
});


const editUser = catchAsync(async (req, res, next) => {
    // Find the user by ID from the route parameter
    const existingUser = await user.findByPk(req.params.id);
    if (!existingUser) {
        return res.status(404).json({
            status: 'Failed',
            message: 'User not found',
        });
    }

    // Validation for updating user fields
    await body('userType')
        .optional() // Allow this field to be optional
        .notEmpty()
        .withMessage('Role is required')
        .run(req);

    await body('email')
        .optional() // Allow this field to be optional
        .isEmail()
        .withMessage('Invalid email address')
        .bail()
        .custom(async (value) => {
            if (value) {
                const userExist = await user.findOne({
                    where: { email: value, id: { [Op.ne]: req.params.id } }
                }); // Ensure no other user has the same email
                if (userExist) {
                    throw new Error('Email already exists');
                }
            }
        })
        .run(req);

    await body('password')
        .optional()
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
        .run(req);

    await body('confirmPassword')
        .optional()
        .custom((value, { req }) => value === req.body.password)
        .withMessage('Passwords do not match')
        .run(req);

    await body('name')
        .optional()
        .notEmpty()
        .withMessage('Name is required')
        .run(req);

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const formattedErrors = errors.array().reduce((acc, error) => {
            acc[error.path] = error.msg;
            return acc;
        }, {});

        return res.status(400).json({
            status: 'Failed',
            errors: formattedErrors,
        });
    }

    // Update the user with validated fields
    const { userType, name, email, password } = req.body;

    // Use update method instead of save to ensure only existing users are updated
    const updateData = {};

    if (userType) updateData.userType = userType;
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (password) updateData.password = bcrypt.hashSync(password, 10);

    const [updatedRowsCount, updatedRows] = await user.update(updateData, {
        where: { id: req.params.id },
        returning: true, // Return the updated rows (needed for returning updated user data)
    });

    if (updatedRowsCount === 0) {
        return res.status(404).json({
            status: 'Failed',
            message: 'User not found',
        });
    }

    const updatedUser = updatedRows[0].toJSON(); // Get updated user instance

    // Exclude sensitive fields
    delete updatedUser.password;
    delete updatedUser.deletedAt;

    return res.status(200).json({
        status: 'Success',
        data: updatedUser,
    });
});

const deleteUser = catchAsync(async (req, res, next) => {
    // Find the user by ID from the route parameter
    const userToDelete = await user.findByPk(req.params.id);
    if (!userToDelete) {
        return res.status(404).json({
            status: 'Failed',
            message: 'User not found',
        });
    }

    // Soft delete the user (this sets the deletedAt field)
    await userToDelete.destroy(); // This will mark the record as deleted

    return res.status(200).json({
        status: 'Success',
        message: 'User deleted successfully',
    });
});




module.exports = { getAllDataParameter, createDataParameter, editUser, deleteUser }

require('dotenv').config()
const user = require('../db/sqModels/user')
const catchAsync = require("../utils/catchAsync");
const AppError = require('../utils/appError')
const jwt = require('jsonwebtoken')

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

    if (!claims) {
        return next(new AppError('Unauthenticated', 401))
    }

    const userData = await user.findOne({ id: claims.id })

    const { password, createdAt, deletedAt, updatedAt, ...data } = await userData.toJSON()

    return res.json({
        data
    })
})


module.exports = { getUser, getAllUser }

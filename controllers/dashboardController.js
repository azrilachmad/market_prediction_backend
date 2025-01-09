require('dotenv').config()
const Vehicle = require("../model/vehicleModel.js");
const { convDate } = require("../helper/index.js");
const catchAsync = require('../utils/catchAsync.js');
const sequelize = require("../config/db.js");
const { DataTypes, Op, Sequelize } = require("sequelize");
const scheduleLog = require('../db/sqModels/scheduleLog.js');


const getAllVehicleCount = catchAsync(async (req, res) => {
    try {
        const vehicles = await Vehicle.count()
        res.json({
            data: vehicles,
            error: false,
            message: "OK - The request was successfull",
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Internal Server Error" })
    }
})

const getToBeProcessedData = catchAsync(async (req, res) => {
    try {
        const vehicles = await Vehicle.count({
            where: {
                [Op.or]: [
                    { checked: false },
                    { checked: null },
                ],
            },
        })
        res.json({
            data: vehicles,
            error: false,
            message: "OK - The request was successfull",
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Internal Server Error" })
    }
})

const getProcessedData = catchAsync(async (req, res) => {
    try {
        const vehicles = await Vehicle.count({
            where: {
                checked: true,
            },
        })
        res.json({
            data: vehicles,
            error: false,
            message: "OK - The request was successfull",
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Internal Server Error" })
    }
})

const getLogData = (async (req, res) => {

    
    try {
        const {startDate, endDate} = req.query
        
        const chart1Data = await scheduleLog.findAndCountAll({
            where: {
                date: {
                    [Op.between]: [new Date(startDate).setHours(0, 0, 0), new Date(endDate).setHours(23, 59, 59)] // Replace startDate and endDate with your actual values
                }
            },
            order: [['date', 'ASC']]
        });
        res.json({
            data: chart1Data.rows,
            total: chart1Data.count,
            error: false,
            message: "OK - The request was successfull",            
        });

    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Internal Server Error" })
    }
})


module.exports = {
    getAllVehicleCount,
    getToBeProcessedData,
    getProcessedData,
    getLogData
}
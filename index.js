require('dotenv').config()
const PORT = process.env.PORT || 3001;

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./config/db.js');
const catchAsync = require('./utils/catchAsync.js');
const AppError = require('./utils/appError.js');
const app = express();
const globalErrorHandler = require('./controllers/errorController.js')
const cron = require('node-cron');
const jobSchedule = require('./db/sqModels/jobSchedule.js')
const scheduleLog = require('./db/sqModels/scheduleLog.js')
const { convDate, msToHHMMSS, setUTC7 } = require('./helper/index.js')
const Cars = require('./model/vehicleModel.js');
const dataParameter = require('./db/sqModels/dataParameter.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const dataSource = require('./db/sqModels/dataSource.js');
const { Op, Sequelize } = require('sequelize');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: { "response_mime_type": "application/json" },
});


// Define every route
const vehicleRoute = require('./routes/vehicleRoute.js')
const authRoute = require('./routes/authRoute.js')
const userRoute = require('./routes/userRoute.js')
const dataParameterRoute = require('./routes/dataParameterRoute.js')
const dataSourceRoute = require('./routes/dataSourceRoute.js')
const jobScheduleRoute = require('./routes/jobScheduleRoute.js');
const dashboardRoute = require('./routes/dashboardRoute.js');



const corsOptions = {
    origin: '*', // Allowed origin
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
    credentials: true, // Include cookies if necessary
};
app.use(cors(corsOptions));

app.use(express.json());

db.authenticate()
    .then(() => console.log('Database Connected...'))
    .catch(err => console.error("Error connecting to the database: ", err))

app.use(vehicleRoute);
app.use(authRoute);
app.use(userRoute);
app.use(dataParameterRoute);
app.use(dataSourceRoute);
app.use(jobScheduleRoute);
app.use(dashboardRoute);



(async () => {
    try {
        let parseData = [];
        let currentCronJob = null;

        // Fetch the schedule data from the database
        async function fetchJobSchedule() {
            const jobScheduleData = await jobSchedule.findAll();
            parseData = jobScheduleData.map((item) => item.toJSON());
            return {
                hour: convDate(parseData[0].time, 'hh'),
                minute: convDate(parseData[0].time, 'mm'),
                second: convDate(parseData[0].time, 'ss'),
                parseData,
            };
        }

        // Schedule the price check job
        function schedulePriceCheck({ hour, minute, second, parseData }) {
            // Stop the existing job if it exists
            if (currentCronJob) {
                currentCronJob.stop();
                console.log('Previous cron job stopped.');
            }

            // Create a new cron job
            // const cronTime = `56 * * * *`; // Dynamic schedule
            const cronTime = `${minute} ${hour} * * *`; // Dynamic schedule
            currentCronJob = cron.schedule(cronTime, async () => {
                console.log('Price check cron job running...');

                try {
                    const startTime = Date.now();

                    // --- Begin price-check logic ---
                    const rawData = await Cars.findAndCountAll({
                        limit: parseData[0].max_record,
                        offset: 0,
                        order: [['updated_at', 'ASC']],
                        where: {
                            [Op.and]: [
                                { hit_count: { [Op.lt]: 2 } }, // Kondisi hit_count < 2
                                {
                                    [Op.or]: [
                                        { harga_atas: 0 }, // harga_atas = 0
                                        { harga_bawah: 0 }, // harga_bawah = 0
                                        { harga_atas: { [Op.is]: null } }, // harga_atas = null
                                        { harga_bawah: { [Op.is]: null } }, // harga_bawah = null
                                    ],
                                },
                            ],
                        },
                    });

                    let dataSet = rawData.rows.map((item) => item.dataValues);

                    // Dynamic parameters
                    const dataParam = await dataParameter.findAndCountAll({ where: { status: true } });
                    let parameterSet = {};
                    dataParam.rows.map((item) => {
                        parameterSet = { ...parameterSet, [item.dataValues.table_column]: item.dataValues.parameter };
                    });

                    const dataSourceData = await dataSource.findAndCountAll({ where: { status: true } });
                    let sourceSet = dataSourceData.rows.map((item) => item.dataValues.address);

                    let totalToken = 0;

                    if (dataSet.length > 0) {
                        for (const data of dataSet) {
                            const parameterString = Object.entries(parameterSet)
                                .map(([key, value]) => `${value}: ${data[key]}`)
                                .join(", ");
                            const referenceLinks = sourceSet.map((link) => `- ${link}`).join(", ");

                            const prompt = `Berikan Average Market Price untuk ${parameterString} berikut juga bisa menjadi referensi sumber: ${referenceLinks} \n. pastikan output harus sesuai dengan format json sebagai berikut: {"harga_terendah": Harga Terendah, "harga_tertinggi": Harga Tertinggi}.`;

                            const promptResult = await model.generateContent(prompt);
                            totalToken += promptResult.response.usageMetadata.totalTokenCount * 1;

                            const resultData = JSON.parse(promptResult.response.text());
                            console.log(`Harga Terendah: ${resultData.harga_terendah}, Harga Tertinggi: ${resultData.harga_tertinggi}`)
                            await Cars.update(
                                {
                                    harga_atas: !isNaN(resultData.harga_terendah) ? resultData.harga_terendah * 1 : 0,
                                    harga_bawah: !isNaN(resultData.harga_tertinggi) ? resultData.harga_tertinggi * 1 : 0,
                                    hit_count: Sequelize.literal('hit_count + 1'),
                                },
                                { where: { id: data.id } }
                            );
                        }
                        const endTime = Date.now();
                        const executionTimeInMs = endTime - startTime;
                        const executionTime = msToHHMMSS(executionTimeInMs);
                        const timeSplit = executionTime.split(':');
                        const seconds = (+timeSplit[0]) * 60 * 60 + (+timeSplit[1]) * 60 + (+timeSplit[2]);

                        await scheduleLog.sync({ alter: true });
                        await scheduleLog.create({
                            type: 'Scheduled',
                            date: setUTC7(parseData[0].time),
                            total_data: dataSet.length,
                            total_token: totalToken,
                            average_token: totalToken / dataSet.length,
                            duration: seconds,
                            createdAt: new Date(),
                            updatedAt: new Date(),
                        });
                    } else {
                        console.log('No data to be processed')
                    }

                } catch (error) {
                    console.error('Error in price check job:', error);
                }
            }, {
                timezone: 'Asia/Jakarta',
            });

            console.log(`New cron job scheduled at: ${cronTime}`);
        }

        // Initial schedule setup
        const scheduleData = await fetchJobSchedule();
        schedulePriceCheck(scheduleData);

        // Periodically check for schedule updates (every minute)
        setInterval(async () => {
            const updatedScheduleData = await fetchJobSchedule();

            const hasScheduleChanged =
                updatedScheduleData.hour !== scheduleData.hour ||
                updatedScheduleData.minute !== scheduleData.minute ||
                updatedScheduleData.second !== scheduleData.second;

            if (hasScheduleChanged) {
                console.log('Schedule updated in database, rescheduling the cron job...');
                schedulePriceCheck(updatedScheduleData);
            }
        }, 60000); // Check every 60 seconds

    } catch (error) {
        console.error("Error occurred:", error);
    }
})();

app.use('*', catchAsync(async (req, res, next) => {
    throw new AppError(`Can't find ${req.originalUrl} on this server`, 404)
}))

app.use(globalErrorHandler);


app.listen(PORT, () => console.log(`listening on port: http://localhost:${PORT}`));

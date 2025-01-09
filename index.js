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
const { convDate, msToHHMMSS } = require('./helper/index.js')
const Cars = require('./model/vehicleModel.js');
const dataParameter = require('./db/sqModels/dataParameter.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const dataSource = require('./db/sqModels/dataSource.js');

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



app.use(cors({
    credentials: true,
    origin: '*'
}));
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
        let parseData
        let hour
        let minute
        let second
        // cron.schedule(`00,10,20,30,40,50 * * * * *`, async () => {
        cron.schedule(`00,10,20,30,40,50 * * * * *`, async () => {
            let jobScheduleData = await jobSchedule.findAll();
            parseData = jobScheduleData.map((item) => item.toJSON());

            hour = convDate(parseData[0].time, 'hh');
            minute = convDate(parseData[0].time, 'mm');
            second = convDate(parseData[0].time, 'ss');

            console.log(hour)
            console.log(minute)
            console.log(second)
        }, {
            timezone: 'Asia/Jakarta'
        })


        // Inisiasi CRON berdasarkan waktu dari setting schedule Web UI
        // cron.schedule(`10,20,30,40,50 * * * * *`, async () => {
        cron.schedule(`49 * * * *`, async () => {
            console.log('Cron job started');
            const startTime = Date.now();
            // Proses query data di DB berdasarkan max_record setting
            const rawData = await Cars.findAndCountAll({
                limit: parseData[0].max_record,
                offset: 0,
                order: [['updated_at', 'DESC']],
                where: {
                    harga_atas: null,
                    harga_bawah: null,
                }
            });

            // Store dataset ke array
            let dataSet = [];
            rawData.rows.map((item) => {
                dataSet.push(item.dataValues);
            });
            // console.log(dataSet);

            // Mendapatkan dynamic prompt berdasarkan setting data parameter dari database
            const dataParam = await dataParameter.findAndCountAll({
                where: {
                    status: true,
                }
            });

            let parameterSet = {};
            dataParam.rows.map((item) => {
                parameterSet = {
                    ...parameterSet,
                    [item.dataValues.table_column]: item.dataValues.parameter,
                };
            });
            // console.log(parameterSet);

            // Mendapatkan dynamic prompt berdasarkan setting data source dari database
            const dataSourceData = await dataSource.findAndCountAll({
                where: {
                    status: true,
                }
            });

            let sourceSet = [];
            dataSourceData.rows.map((item) => {
                sourceSet.push(item.dataValues.address);
            });
            // console.log(sourceSet);
            let totalToken = 0
            // Proses Prompting AI (Price Check) berdasarkan dataSet
            for (const data of dataSet) {
                const parameterString = Object.entries(parameterSet)
                    .map(([key, value]) => `${value}: ${data[key]}`)
                    .join(", ");

                const referenceLinks = sourceSet
                    .map((link) => `- ${link}`)
                    .join(", ");

                const prompt = `Berikan Average Market Price untuk ${parameterString}. pastikan output harus sesuai dengan format json sebagai berikut: {"harga_terendah": Harga Terendah, "harga_tertinggi": Harga Tertinggi}.`;

                console.log(prompt);

                try {
                    // Menggunakan await untuk memastikan prompting selesai sebelum melanjutkan ke iterasi berikutnya
                    const promptResult = await model.generateContent(prompt);
                    // console.log(promptResult.response.text());
                    totalToken += promptResult.response.usageMetadata.totalTokenCount * 1
                    console.log(promptResult.response.usageMetadata.totalTokenCount);

                    const resultData = JSON.parse(promptResult.response.text())
                    console.log(resultData)
                    if (!isNaN(resultData.harga_terendah * 1) && !isNaN(resultData.harga_tertinggi * 1)) {
                        // Update harga_atas dan harga_bawah pada tabel Cars
                        await Cars.update(
                            {
                                harga_atas: parseFloat(resultData.harga_terendah * 1),
                                harga_bawah: parseFloat(resultData.harga_tertinggi * 1)
                            },
                            { where: { id: data.id } }
                        );
                    } else {
                        console.warn(`Invalid price data for car ID ${data.id}:`);
                    }

                } catch (error) {
                    console.error(`Error fetching price for car ID ${data.id}:`, error);
                }

                const endTime = Date.now();
                const executionTimeInMs = endTime - startTime;

                const executionTime = msToHHMMSS(executionTimeInMs);

                console.log('Total Token = ' + totalToken)
                console.log(`Execution time: ${executionTime}`)
            }
        }, {
            timezone: 'Asia/Jakarta'
        });
    } catch (error) {
        console.error("Error occurred:", error);
    }
})();

app.use('*', catchAsync(async (req, res, next) => {
    throw new AppError(`Can't find ${req.originalUrl} on this server`, 404)
}))

app.use(globalErrorHandler);


app.listen(PORT, () => console.log(`listening on port: http://localhost:${PORT}`));

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
const { convDate } = require('./helper/index.js')

// Define every route
const vehicleRoute = require('./routes/vehicleRoute.js')
const authRoute = require('./routes/authRoute.js')
const userRoute = require('./routes/userRoute.js')
const dataParameterRoute = require('./routes/dataParameterRoute.js')
const dataSourceRoute = require('./routes/dataSourceRoute.js')
const jobScheduleRoute = require('./routes/jobScheduleRoute.js');
const Cars = require('./model/vehicleModel.js');
const dataParameter = require('./db/sqModels/dataParameter.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const dataSource = require('./db/sqModels/dataSource.js');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: { "response_mime_type": "application/json" },
});




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


(async () => {
    try {
        const jobScheduleData = await jobSchedule.findAll();
        const parseData = jobScheduleData.map((item) => item.toJSON());

        const hour = convDate(parseData[0].time, 'hh');
        const minute = convDate(parseData[0].time, 'mm');
        const second = convDate(parseData[0].time, 'ss');

        // Inisiasi CRON berdasarkan waktu dari setting schedule Web UI
        cron.schedule(`10,20,30,40,50 * * * * *`, async () => {
            console.log('Cron job started');
            const startTime = Date.now();
            // Proses query data di DB berdasarkan max_record setting
            const rawData = await Cars.findAndCountAll({
                limit: parseData[0].max_record,
                offset: 0,
                order: [['updated_at', 'ASC']],
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
                    console.log(promptResult.response.text());
                    totalToken += promptResult.response.usageMetadata.totalTokenCount * 1
                    console.log(promptResult.response.usageMetadata.totalTokenCount);

                    const endTime = Date.now();
                    const executionTime = endTime - startTime; msto

                    // const { harga_terendah, harga_tertinggi } = response.data;

                    // Update harga_atas dan harga_bawah pada tabel Cars
                    // await Cars.update(
                    //     { harga_atas: harga_tertinggi, harga_bawah: harga_terendah },
                    //     { where: { id: data.id } }
                    // );

                } catch (error) {
                    console.error(`Error fetching price for car ID ${data.id}:`, error);
                }
                console.log('Total Token = ' + totalToken)
            }
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

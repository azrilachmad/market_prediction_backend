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
const {convDate} = require('./helper/index.js')

// Define every route
const vehicleRoute = require('./routes/vehicleRoute.js')
const authRoute = require('./routes/authRoute.js')
const userRoute = require('./routes/userRoute.js')
const dataParameterRoute = require('./routes/dataParameterRoute.js')
const dataSourceRoute = require('./routes/dataSourceRoute.js')
const jobScheduleRoute = require('./routes/jobScheduleRoute.js')




app.use(cors({
    credentials: true,
    origin:'*'
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

        const hour =  convDate(parseData[0].time, 'hh') 
        const minute = convDate(parseData[0].time, 'mm')
        const second = convDate(parseData[0].time, 'ss')

        cron.schedule(`${second} * * * * *`, async() => {
            
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

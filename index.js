const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const appRouter = require('./routes/appRouter.js')
const db = require('./config/db.js');
const catchAsync = require('./utils/catchAsync.js');
const AppError = require('./utils/appError.js');
const { error } = require('console');
const app = express();
const PORT = process.env.PORT || 3001;
require('dotenv').config
const globalErrorHandler = require('./controllers/errorController.js')


app.use(cors());
app.use(express.json());
db.authenticate()
    .then(() => console.log('Database Connected...'))
    .catch(err => console.error("Error connecting to the database: ", err))

app.use(appRouter);


app.use('*', catchAsync(async (req, res, next) => {
    throw new AppError('Error', 404)
}))

app.use(globalErrorHandler);


app.listen(PORT, () => console.log(`listening on port: http://localhost:${PORT}`));

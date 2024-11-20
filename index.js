const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const appRouter = require('./routes/appRouter.js')
const db = require('./config/db.js')
const app = express();
const PORT = process.env.PORT || 3001;
require('dotenv').config


app.use(cors());
app.use(express.json());
db.authenticate()
.then(() => console.log('Database Connected...'))
.catch(err => console.error("Error connecting to the database: ", err))

app.use(appRouter);

app.listen(PORT, () => console.log(`listening on port: http://localhost:${PORT}`));

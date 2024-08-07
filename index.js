import express from 'express';
import bodyParser from 'body-parser'
import cors from 'cors';
import vehiclesRoutes from './routes/vehicles.js'
import db from './config/db.js'

const app = express();
const PORT = 3001;


app.use(cors());
app.use(express.json());
db.authenticate()
    .then(() => console.log('Database Connected...'))
    .catch(err => console.error("Error connecting to the database: ", err))


app.use(vehiclesRoutes);


app.listen(PORT, () => console.log(`listening on port: http://localhost:${PORT}`));

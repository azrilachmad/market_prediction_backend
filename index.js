import express from 'express';
import bodyParser from 'body-parser'
import cors from 'cors';
import vehiclesRoutes from './routes/vehicles.js'
import db from './config/db.js'

const app = express();
const PORT = 3001;


app.use(cors({ origin: ['*', 'http://marketprediction.103.90.249.152.nip.io', 'marketprediction.103.90.249.152.nip.io'] }));
app.use(express.json());
db.authenticate()
    .then(() => console.log('Database Connected...'))
    .catch(err => console.error("Error connecting to the database: ", err))


app.use(vehiclesRoutes);


app.listen(PORT, () => console.log(`listening on port: http://localhost:${PORT}`));

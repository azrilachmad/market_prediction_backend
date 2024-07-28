import express from 'express';
import bodyParser from 'body-parser'
import cors from 'cors';
import vehiclesRoutes from './routes/vehicles.js'

const app = express();
const PORT = 5000;


app.use(cors());

app.use(bodyParser.json());

app.use('/', vehiclesRoutes)


app.listen(PORT, () => console.log(`listening on port: http://localhost:${PORT}`));

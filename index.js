import express from 'express';
import bodyParser from 'body-parser'
import cors from 'cors';
import vehiclesRoutes from './routes/vehicles.js'
import db from './config/db.js'
import * as http from 'http';
import dotenv from "dotenv";
dotenv.config();

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());
db.authenticate()
    .then(() => console.log('Database Connected...'))
    .catch(err => console.error("Error connecting to the database: ", err))

app.use(vehiclesRoutes);

const hostname = process.env.HOSTNAME;

const port = 3001;


const server = http.createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Hello World!\n');
});

server.listen(port, hostname, () => {           
    console.log(`Server running at http://${hostname}:${port}/`);
});


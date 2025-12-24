import express from 'express';
import bodyParser from 'body-parser';
import viewEngine from './config/viewEngine';
import initWebRoutes from './routes/web';
import connectDB from './config/connectDB';
import cors from 'cors'
import routes from './routes/index'
import cookieParser from 'cookie-parser';
import { expirePendingBookingsJob } from './jobs/expireBookings';


require('dotenv').config();

let app = express();

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));

app.use(cookieParser());

//config app

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

viewEngine(app);


// Dùng route tổng hợp từ index.js
app.use(routes);
// initWebRoutes(app);

connectDB();
setInterval(() => {
  expirePendingBookingsJob();
}, 60 * 1000);
//port === undefined => port = 8080
let port = process.env.PORT || 8080;
app.listen(port, ()=>{
    //callback
    console.log('Backend NodeJS is running on the port: ' + port);
})
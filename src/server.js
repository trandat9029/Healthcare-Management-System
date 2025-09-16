import express from 'express';
import bodyParser from 'body-parser';
import viewEngine from './config/viewEngine';
import initWebRoutes from './routes/web';
import connectDB from './config/connectDB';
import cors from 'cors'

require('dotenv').config();

let app = express();

// app.use(function (req, res, next){
//     res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_ORIGIN );
//     res.setHeader('Access-Control-Allow-Credentials', true);
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
//     res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//     next();
// })

app.use(cors({ origin: true }));

//config app

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

viewEngine(app);
initWebRoutes(app);

connectDB();

//port === undefined => port = 8080
let port = process.env.PORT || 8080;
app.listen(port, ()=>{
    //callback
    console.log('Backend NodeJS is running on the port: ' + port);
})
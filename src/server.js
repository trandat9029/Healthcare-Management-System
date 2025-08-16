import express from 'express';
import bodyParser from 'body-parser';
import viewEngine from './config/viewEngine';
import initWebRoutes from './routes/web';
import connectDB from './config/connectDB';
import cors from 'cors'

require('dotenv').config();

let app = express();
// Cho phép sửa nhanh origin qua env nếu cần
// const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';

// // ----- CORS (đặt TRƯỚC mọi middleware/route) -----
// const corsOptions = {
//   origin: FRONTEND_ORIGIN,                 // KHÔNG dùng '*'
//   credentials: true,                       // cho phép cookie/session
//   methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
//   optionsSuccessStatus: 204,               // status cho preflight
// };
// app.use(cors(corsOptions));

// // Short-circuit preflight để trả 204 ngay (tránh rơi vào route khác)
// app.use((req, res, next) => {
//   if (req.method === 'OPTIONS') return res.sendStatus(204);
//   next();
// });
app.use(cors({ origin: true }));

//config app

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

viewEngine(app);
initWebRoutes(app);

connectDB();

//port === undefined => port = 8080
let port = process.env.PORT || 8080;
app.listen(port, ()=>{
    //callback
    console.log('Backend NodeJS is running on the port: ' + port);
})
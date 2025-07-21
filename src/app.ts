import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import signInRoutes from './routes/userRoutes';
import balanceRoutes from './routes/balanceRoutes';
import checkPayment from './routes/admin/adminRoutes';
import fforder from './routes/ffOrderRoutes';

const app = express();

// default middleware
app.use(
  cors({
    origin: [process.env.FRONTEND_URL!, process.env.FRONTEND_URL_ADMIN!],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'UPDATE', 'PATCH'],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(
  express.json({
    limit: '5mb',
  })
);
app.use(
  bodyParser.urlencoded({
    extended: true,
    limit: '5mb',
  })
);
app.use(express.static('./public'));

// user routes api
app.use('/api/v1/users', signInRoutes);
app.use('/api/v1/balance', balanceRoutes);
app.use('/api/v1/admin', checkPayment);
app.use('/api/v1/fforder', fforder);

// server check api
app.get("/",(req,res)=>{
  res.send("MoneyHub Server is running");
})
export default app;

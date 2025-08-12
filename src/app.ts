import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import signInRoutes from './routes/userRoutes';
import balanceRoutes from './routes/balanceRoutes';
import checkPayment from './routes/admin/adminRoutes';
import fforder from './routes/ffOrderRoutes';
import ffTournamentRoute from './routes/ffTournamentRoutes';
import admin from 'firebase-admin';

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

// firebase service
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT as string);

// firebase admin sdk
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// notification end point
app.post('/send-notification', async (req, res) => {
  const { token, title, body } = req.body;

  // Basic validation to ensure all required fields are present.
  if (!token || !title || !body) {
    return res.status(400).send({ error: 'Missing required fields: token, title, body' });
  }

  const message = {
    notification: {
      title: title,
      body: body,
    },
    token: token
  };

  try {
    // Send the message using the Firebase Admin SDK.
    const response = await admin.messaging().send(message);
    console.log('Successfully sent message:', response);
    res.status(200).send({ success: true, messageId: response });
  } catch (error:any) {
    console.error('Error sending message:', error);
    res.status(500).send({ success: false, error: error.message });
  }
});

// user routes api
app.use('/api/v1/users', signInRoutes);
app.use('/api/v1/balance', balanceRoutes);
app.use('/api/v1/admin', checkPayment);
app.use('/api/v1/fforder', fforder);
app.use('/api/v1/tournament', ffTournamentRoute);

// server check api
app.get('/', async (req, res) => {
  res.send('MoneyHub Server is running');
});
export default app;

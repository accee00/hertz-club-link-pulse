import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { ApiError } from './utils/api_error.js';
const app = express();

app.use(cors());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

import userRouter from './routes/user_routes.js';

app.use('/api/v1/users', userRouter);

app.route('/health').get((req, res) => {
  res.send("Yoo!! What's uppp.");
});

app.use((err, req, res, next) => {
  console.error({
    timestamp: new Date().toISOString(),
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  if (err instanceof ApiError) {
    return sendResponse(res, err);
  }

  return res.status(500).json({
    statusCode: 500,
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

export { app };

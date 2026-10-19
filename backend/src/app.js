import express from 'express';
import cors from 'cors';
import { adminRouter } from './routes/admin.routes.js';
import { authRouter } from './routes/auth.routes.js';
import { campaignRouter } from './routes/campaign.routes.js';
import { workspaceRouter } from './routes/workspace.routes.js';
import { ApiError } from './utils/api_error.js';

const app = express();

app.use(cors());
app.use(express.json({ limit: '16kb' }));
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/workspaces', workspaceRouter);
app.use('/api/v1/campaigns', campaignRouter);

app.use((req, res, next) => {
  next(new ApiError({ statusCode: 404, message: 'Route not found' }));
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  const statusCode = error.statusCode || (error.code === 11000 ? 409 : 500);
  const message =
    error.code === 11000
      ? 'An account with this email already exists'
      : error.message;

  res.status(statusCode).json({
    success: false,
    message: statusCode === 500 ? 'Internal server error' : message,
    errors: error.errors || [],
  });
});

export { app };

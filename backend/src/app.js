import express from 'express';
import cors from 'cors';
import { adminRouter } from './routes/admin.routes.js';
import { authRouter } from './routes/auth.routes.js';
import { campaignRouter } from './routes/campaign.routes.js';
import { linkRouter } from './routes/link.routes.js';
import { redirectRouter } from './routes/redirect.routes.js';
import { workspaceRouter } from './routes/workspace.routes.js';
import { ApiError } from './utils/api_error.js';
import { sendError, sendResponse } from './utils/send_reponse.js';

const app = express();

app.set('trust proxy', 1);

app.use(cors({
 origin: '*'
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: '16kb' }));

app.route('/health').get((req, res) => {
  res.send("Yoo!! What's uppp.");
});

app.get('/', (req, res) => {
  res.type('html').send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#f4f5f1" />
    <title>Link Pulse</title>
    <style>
      * { box-sizing: border-box; }
      body {
        display: grid;
        min-height: 100vh;
        margin: 0;
        padding: 24px;
        place-items: center;
        background: #f4f5f1;
        color: #27362f;
        font-family: "DM Sans", Arial, sans-serif;
      }
      main {
        width: min(100%, 460px);
        padding: 36px;
        border: 1px solid #e5e9e3;
        border-radius: 12px;
        background: #fff;
        text-align: center;
      }
      strong {
        color: #245e4e;
        font-size: 12px;
        letter-spacing: 1.4px;
      }
      h1 {
        margin: 28px 0 12px;
        font-family: Manrope, Arial, sans-serif;
        font-size: 25px;
      }
      p {
        margin: 0;
        color: #748078;
        font-size: 14px;
        line-height: 1.6;
      }
    </style>
  </head>
  <body>
    <main>
      <strong>LINK PULSE</strong>
      <h1>Short links, clear insights.</h1>
      <p>This is the Link Pulse link service. You can close this tab and return to the app.</p>
    </main>
  </body>
</html>`);
});

app.use('/r', redirectRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/workspaces', workspaceRouter);
app.use('/api/v1/campaigns', campaignRouter);
app.use('/api/v1/links', linkRouter);

app.use((req, res, next) => {
  next(new ApiError({ statusCode: 404, message: 'Route not found' }));
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  if (error instanceof ApiError) {
    return sendResponse(res, error);
  }

  const statusCode = error.statusCode || (error.code === 11000 ? 409 : 500);
  const message =
    error.code === 11000
      ? 'An account with this email already exists'
      : error.message || 'Internal Server Error';

  return sendError(
    res,
    new ApiError({
      statusCode,
      message,
      errors: error.errors || [],
    })
  );
});

export { app };

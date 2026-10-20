import bcrypt from 'bcrypt';
import { Link } from '../models/link.model.js';
import { ApiError } from '../utils/api_error.js';
import { ApiResponse } from '../utils/api_reponse.js';
import { asyncHandler } from '../utils/async_handler.js';
import { logClickAsync } from '../utils/click_logger.js';
import { sendResponse } from '../utils/send_reponse.js';
import { isDomainBlocked } from '../utils/domain_helper.js';

const escapeHtml = (value) =>
  value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[character]
  );

const renderRedirectErrorHtml = (message) => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#f4f5f1" />
    <title>Link unavailable | Link Pulse</title>
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
        box-shadow: 0 18px 55px rgba(31, 50, 40, .08);
        text-align: center;
      }
      .brand {
        color: #245e4e;
        font-size: 12px;
        font-weight: 800;
        letter-spacing: 1.4px;
      }
      .icon {
        display: grid;
        width: 54px;
        height: 54px;
        margin: 28px auto 18px;
        place-items: center;
        border-radius: 50%;
        background: #fff1e9;
        color: #a24d32;
        font-size: 25px;
      }
      h1 {
        margin: 0;
        font-family: Manrope, Arial, sans-serif;
        font-size: 25px;
      }
      p {
        margin: 12px 0 24px;
        color: #748078;
        font-size: 14px;
        line-height: 1.6;
      }
      button {
        min-height: 42px;
        padding: 0 17px;
        border: 0;
        border-radius: 6px;
        background: #245e4e;
        color: #fff;
        cursor: pointer;
        font: inherit;
        font-size: 13px;
        font-weight: 700;
      }
      button:hover { background: #183f35; }
    </style>
  </head>
  <body>
    <main>
      <div class="brand">LINK PULSE</div>
      <div class="icon" aria-hidden="true">!</div>
      <h1>This link is unavailable</h1>
      <p>${escapeHtml(message)}</p>
      <button type="button" onclick="history.back()">Go back</button>
    </main>
  </body>
</html>`;

const sendRedirectError = (req, res, error) => {
  if (req.query?.format === 'json') {
    throw error;
  }

  return res
    .status(error.statusCode)
    .type('html')
    .send(renderRedirectErrorHtml(error.message));
};

const renderPasswordPromptHtml = (shortCode) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Password Protected Link</title>
</head>
<body style="display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0;font-family:sans-serif;">
  <div>
    <h3>Enter Password</h3>
    <form id="passForm">
      <input type="password" id="pwd" placeholder="Enter password" required autofocus />
      <button type="submit">Unlock</button>
    </form>
    <p id="errMsg" style="color:red;display:none;"></p>
  </div>
  <script>
    document.getElementById('passForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const err = document.getElementById('errMsg');
      err.style.display = 'none';
      try {
        const res = await fetch('/r/${shortCode}/verify-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: document.getElementById('pwd').value })
        });
        const data = await res.json();
        if (res.ok && data.data?.destinationUrl) {
          window.location.href = data.data.destinationUrl;
        } else {
          err.innerText = data.message || 'Incorrect password';
          err.style.display = 'block';
        }
      } catch (e) {
        err.innerText = 'An error occurred';
        err.style.display = 'block';
      }
    });
  </script>
</body>
</html>`;

const evaluateLinkRules = (link) => {
  if (!link) {
    throw new ApiError({
      statusCode: 404,
      message: 'Short link not found',
    });
  }

  if (link.status !== 'active') {
    throw new ApiError({
      statusCode: 410,
      message: 'This link has been disabled',
    });
  }

  if (link.expiresAt && new Date() > new Date(link.expiresAt)) {
    throw new ApiError({
      statusCode: 410,
      message: 'This link has expired',
    });
  }

  if (
    link.clickLimit !== null &&
    link.clickLimit !== undefined &&
    link.totalClicks >= link.clickLimit
  ) {
    throw new ApiError({
      statusCode: 410,
      message: 'This link has reached its maximum click limit',
    });
  }
};

const handleRedirect = asyncHandler(async (req, res) => {
  const { shortCode } = req.params;

  const link = await Link.findOne({ shortCode }).select('+passwordHash');
  try {
    evaluateLinkRules(link);
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
    return sendRedirectError(req, res, error);
  }

  if (await isDomainBlocked(link.destinationUrl)) {
    return sendRedirectError(
      req,
      res,
      new ApiError({
        statusCode: 403,
        message:
          'This link cannot be opened because its destination domain is blocked for safety.',
      })
    );
  }

  if (link.passwordHash) {
    const providedPassword =
      req.query?.pwd || req.query?.password || req.get('x-link-password');

    if (!providedPassword) {
      if (req.accepts('html')) {
        return res.status(401).send(renderPasswordPromptHtml(link.shortCode));
      }
      
      throw new ApiError({
        statusCode: 401,
        message: 'This link is password protected',
        data: {
          isPasswordRequired: true,
          shortCode: link.shortCode,
        },
      });
    }

    const isMatch = await bcrypt.compare(providedPassword, link.passwordHash);
    if (!isMatch) {
      throw new ApiError({
        statusCode: 401,
        message: 'Invalid password for this link',
        data: {
          isPasswordRequired: true,
          shortCode: link.shortCode,
        },
      });
    }
  }

  logClickAsync({ link, req });

  if (req.query?.format === 'json') {
    return sendResponse(
      res,
      new ApiResponse({
        statusCode: 200,
        message: 'Redirect destination found',
        data: {
          destinationUrl: link.destinationUrl,
        },
      })
    );
  }

  return res.redirect(302, link.destinationUrl);
});

const verifyLinkPassword = asyncHandler(async (req, res) => {
  const { shortCode } = req.params;
  const { password } = req.body;

  const link = await Link.findOne({ shortCode }).select('+passwordHash');
  evaluateLinkRules(link);

  if (await isDomainBlocked(link.destinationUrl)) {
    throw new ApiError({
      statusCode: 403,
      message:
        'This link cannot be opened because its destination domain is blocked for safety.',
    });
  }

  if (!link.passwordHash) {
    logClickAsync({ link, req });
    return sendResponse(
      res,
      new ApiResponse({
        statusCode: 200,
        message: 'Link is not password protected',
        data: {
          destinationUrl: link.destinationUrl,
        },
      })
    );
  }

  const isMatch = await bcrypt.compare(password, link.passwordHash);
  if (!isMatch) {
    throw new ApiError({
      statusCode: 401,
      message: 'Incorrect password',
      data: {
        isPasswordRequired: true,
        shortCode: link.shortCode,
      },
    });
  }

  logClickAsync({ link, req });

  return sendResponse(
    res,
    new ApiResponse({
      statusCode: 200,
      message: 'Password verified successfully',
      data: {
        destinationUrl: link.destinationUrl,
      },
    })
  );
});

const getLinkPreview = asyncHandler(async (req, res) => {
  const { shortCode } = req.params;

  const link = await Link.findOne({ shortCode }).select('+passwordHash');
  evaluateLinkRules(link);

  return sendResponse(
    res,
    new ApiResponse({
      statusCode: 200,
      message: 'Link preview retrieved',
      data: {
        shortCode: link.shortCode,
        isPasswordProtected: Boolean(link.passwordHash),
        destinationUrl: link.passwordHash ? null : link.destinationUrl,
      },
    })
  );
});

export { getLinkPreview, handleRedirect, verifyLinkPassword };

import bcrypt from 'bcrypt';
import { Link } from '../models/link.model.js';
import { ApiError } from '../utils/api_error.js';
import { ApiResponse } from '../utils/api_reponse.js';
import { asyncHandler } from '../utils/async_handler.js';
import { logClickAsync } from '../utils/click_logger.js';
import { sendResponse } from '../utils/send_reponse.js';

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
  evaluateLinkRules(link);

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

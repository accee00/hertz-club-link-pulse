import bcrypt from 'bcrypt';
import { Link } from '../models/link.model.js';
import { ApiError } from '../utils/api_error.js';
import { ApiResponse } from '../utils/api_reponse.js';
import { asyncHandler } from '../utils/async_handler.js';
import { logClickAsync } from '../utils/click_logger.js';
import { sendResponse } from '../utils/send_reponse.js';
import { isDomainBlocked } from '../utils/domain_helper.js';
import config from '../config/config.js';

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
      .home-link {
        display: inline-grid;
        min-height: 42px;
        margin-top: 8px;
        padding: 0 17px;
        place-items: center;
        border: 1px solid #dfe7df;
        border-radius: 6px;
        background: #fff;
        color: #245e4e;
        font-size: 13px;
        font-weight: 700;
        text-decoration: none;
      }
      .home-link:hover { background: #f5f8f3; }
    </style>
  </head>
  <body>
    <main>
      <div class="brand">LINK PULSE</div>
      <div class="icon" aria-hidden="true">!</div>
      <h1>This link is unavailable</h1>
      <p>${escapeHtml(message)}</p>
      <a class="home-link" href="${escapeHtml(new URL('/dashboard', config.FRONTEND_URL).toString())}">Return to your dashboard</a>
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

const renderPasswordPromptHtml = (shortCode) => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#f4f5f1" />
    <title>Password protected link | Link Pulse</title>
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
        width: min(100%, 440px);
        padding: 36px;
        border: 1px solid #e5e9e3;
        border-radius: 12px;
        background: #fff;
        box-shadow: 0 18px 55px rgba(31, 50, 40, .08);
      }
      .brand {
        color: #245e4e;
        font-size: 12px;
        font-weight: 800;
        letter-spacing: 1.4px;
        text-align: center;
      }
      .icon {
        display: grid;
        width: 52px;
        height: 52px;
        margin: 27px auto 18px;
        place-items: center;
        border-radius: 50%;
        background: #eef4e9;
        color: #245e4e;
        font-size: 22px;
      }
      h1 {
        margin: 0;
        font-family: Manrope, Arial, sans-serif;
        font-size: 24px;
        text-align: center;
      }
      .description {
        margin: 10px 0 24px;
        color: #748078;
        font-size: 13px;
        line-height: 1.6;
        text-align: center;
      }
      label {
        display: block;
        margin-bottom: 8px;
        color: #435148;
        font-size: 12px;
        font-weight: 700;
      }
      input {
        width: 100%;
        height: 46px;
        padding: 0 12px;
        border: 1px solid #dfe6de;
        border-radius: 6px;
        background: #fff;
        color: #27362f;
        font: inherit;
        font-size: 14px;
      }
      input:focus {
        border-color: #5b8a71;
        outline: 3px solid rgba(36, 94, 78, .12);
      }
      button {
        width: 100%;
        min-height: 44px;
        margin-top: 14px;
        border: 0;
        border-radius: 6px;
        background: #245e4e;
        color: #fff;
        cursor: pointer;
        font: inherit;
        font-size: 13px;
        font-weight: 700;
      }
      button:hover:not(:disabled) { background: #183f35; }
      button:disabled { cursor: wait; opacity: .7; }
      .error {
        margin: 12px 0 0;
        padding: 10px 12px;
        border: 1px solid #f0d3ca;
        border-radius: 5px;
        background: #fff4f0;
        color: #8b4033;
        font-size: 12px;
        line-height: 1.5;
      }
      .error[hidden] { display: none; }
      @media (max-width: 480px) {
        main { padding: 28px 22px; }
      }
    </style>
  </head>
  <body>
    <main>
      <div class="brand">LINK PULSE</div>
      <div class="icon" aria-hidden="true">🔒</div>
      <h1>Password protected</h1>
      <p class="description">Enter the password provided by the person who shared this link to continue.</p>
      <form id="password-form">
        <label for="password">Link password</label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="Enter password"
          autocomplete="current-password"
          required
          autofocus
        />
        <button id="unlock-button" type="submit">Unlock link</button>
        <p class="error" id="error-message" role="alert" aria-live="polite" hidden></p>
      </form>
    </main>
    <script>
      const form = document.getElementById('password-form');
      const passwordInput = document.getElementById('password');
      const unlockButton = document.getElementById('unlock-button');
      const errorMessage = document.getElementById('error-message');

      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        errorMessage.hidden = true;
        unlockButton.disabled = true;
        unlockButton.textContent = 'Checking password…';

        try {
          const response = await fetch('/r/${encodeURIComponent(shortCode)}/verify-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: passwordInput.value })
          });
          const result = await response.json();

          if (response.ok && result.data?.destinationUrl) {
            window.location.assign(result.data.destinationUrl);
            return;
          }

          errorMessage.textContent = result.message || 'The password could not be verified.';
          errorMessage.hidden = false;
          passwordInput.focus();
          passwordInput.select();
        } catch {
          errorMessage.textContent = 'Could not verify the password. Check your connection and try again.';
          errorMessage.hidden = false;
        } finally {
          unlockButton.disabled = false;
          unlockButton.textContent = 'Unlock link';
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

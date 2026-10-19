import crypto from 'node:crypto';
import { isbot } from 'isbot';
import config from '../config/config.js';
import { ClickEvent } from '../models/click_event.model.js';
import { Link } from '../models/link.model.js';

const isBotRequest = (req) => {
  const userAgent = req.get('user-agent');
  if (!userAgent || userAgent.trim() === '') {
    return true;
  }
  return isbot(userAgent);
};

const detectDevice = (userAgent = '') => {
  const ua = userAgent.toLowerCase();
  if (/ipad|tablet|(android(?!.*mobile))|playbook|silk/i.test(ua)) {
    return 'tablet';
  }
  if (
    /mobile|iphone|ipod|android.*mobile|blackberry|iemobile|opera mini/i.test(
      ua
    )
  ) {
    return 'mobile';
  }
  return 'desktop';
};

const detectBrowser = (userAgent = '') => {
  const ua = userAgent.toLowerCase();
  if (/edg/i.test(ua)) return 'Edge';
  if (/opera|opr/i.test(ua)) return 'Opera';
  if (/chrome|crios/i.test(ua)) return 'Chrome';
  if (/firefox|fxios/i.test(ua)) return 'Firefox';
  if (/safari/i.test(ua)) return 'Safari';
  return 'Other';
};

const generateVisitorHash = (req) => {
  const clientIp =
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.ip ||
    req.socket?.remoteAddress ||
    '127.0.0.1';

  const userAgent = req.get('user-agent') || '';
  const salt = config.JWT_SECRET || 'linkpulse-salt';

  return crypto
    .createHash('sha256')
    .update(`${clientIp}-${userAgent}-${salt}`)
    .digest('hex');
};

const logClickAsync = async ({ link, req }) => {
  try {
    if (isBotRequest(req)) {
      return;
    }

    const userAgent = req.get('user-agent') || '';
    const device = detectDevice(userAgent);
    const browser = detectBrowser(userAgent);
    const visitorHash = generateVisitorHash(req);

    const source =
      req.query?.src === 'qr' || req.query?.source === 'qr' ? 'qr' : 'direct';

    const rawReferrer = req.get('referrer') || req.get('referer') || '';
    let referrer = 'direct';
    if (rawReferrer) {
      try {
        referrer = new URL(rawReferrer).hostname;
      } catch {
        referrer = rawReferrer.slice(0, 100);
      }
    }

    await Promise.all([
      ClickEvent.create({
        link: link._id,
        clickedAt: new Date(),
        referrer,
        device,
        browser,
        source,
        visitorHash,
      }),
      Link.updateOne({ _id: link._id }, { $inc: { totalClicks: 1 } }),
    ]);
  } catch (error) {
    console.error('Async click logging error:', error.message);
  }
};

export {
  detectBrowser,
  detectDevice,
  generateVisitorHash,
  isBotRequest,
  logClickAsync,
};

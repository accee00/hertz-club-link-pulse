import { ClickEvent } from '../models/click_event.model.js';

/**
 * Aggregates click events for one or more links over a given time period
 * @param {Object} options
 * @param {mongoose.Types.ObjectId|Array<mongoose.Types.ObjectId>} options.linkIds
 * @param {string} [options.period='7d'] - '24h' | '7d' | '30d' | 'all'
 */
const aggregateClickAnalytics = async ({ linkIds, period = '7d' }) => {
  const match = {
    link: Array.isArray(linkIds) ? { $in: linkIds } : linkIds,
  };

  const now = new Date();
  let startDate = null;
  let dateFormat = '%Y-%m-%d';

  if (period === '24h') {
    startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    dateFormat = '%Y-%m-%d %H:00';
  } else if (period === '7d') {
    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  } else if (period === '30d') {
    startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  if (startDate) {
    match.clickedAt = { $gte: startDate };
  }

  const [
    summaryAgg,
    deviceAgg,
    browserAgg,
    sourceAgg,
    referrerAgg,
    timeSeriesAgg,
  ] = await Promise.all([
    // 1. Total clicks & unique visitors in period
    ClickEvent.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalClicks: { $sum: 1 },
          uniqueHashes: { $addToSet: '$visitorHash' },
        },
      },
      {
        $project: {
          _id: 0,
          totalClicks: 1,
          uniqueVisitors: { $size: '$uniqueHashes' },
        },
      },
    ]),

    // 2. Breakdown by device
    ClickEvent.aggregate([
      { $match: match },
      { $group: { _id: '$device', count: { $sum: 1 } } },
    ]),

    // 3. Breakdown by browser
    ClickEvent.aggregate([
      { $match: match },
      { $group: { _id: '$browser', count: { $sum: 1 } } },
    ]),

    // 4. Breakdown by source (direct vs qr)
    ClickEvent.aggregate([
      { $match: match },
      { $group: { _id: '$source', count: { $sum: 1 } } },
    ]),

    // 5. Top referrers
    ClickEvent.aggregate([
      { $match: match },
      { $group: { _id: '$referrer', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]),

    // 6. Time series
    ClickEvent.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            $dateToString: { format: dateFormat, date: '$clickedAt' },
          },
          clicks: { $sum: 1 },
          uniqueHashes: { $addToSet: '$visitorHash' },
        },
      },
      {
        $project: {
          _id: 0,
          date: '$_id',
          clicks: 1,
          uniques: { $size: '$uniqueHashes' },
        },
      },
      { $sort: { date: 1 } },
    ]),
  ]);

  const totalClicks = summaryAgg[0]?.totalClicks || 0;
  const uniqueVisitors = summaryAgg[0]?.uniqueVisitors || 0;

  const byDevice = { desktop: 0, mobile: 0, tablet: 0 };
  deviceAgg.forEach((d) => {
    if (d._id) byDevice[d._id] = d.count;
  });

  const byBrowser = {};
  browserAgg.forEach((b) => {
    if (b._id) byBrowser[b._id] = b.count;
  });

  const bySource = { direct: 0, qr: 0 };
  sourceAgg.forEach((s) => {
    if (s._id) bySource[s._id] = s.count;
  });

  const topReferrers = referrerAgg.map((r) => ({
    referrer: r._id || 'direct',
    count: r.count,
  }));

  return {
    period,
    summary: {
      totalClicks,
      uniqueVisitors,
      qrScans: bySource.qr || 0,
      directClicks: bySource.direct || 0,
    },
    byDevice,
    byBrowser,
    bySource,
    topReferrers,
    timeSeries: timeSeriesAgg,
  };
};

export { aggregateClickAnalytics };

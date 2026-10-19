import mongoose from 'mongoose';

const clickEventSchema = new mongoose.Schema(
  {
    link: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Link',
      required: true,
      index: true,
    },
    clickedAt: {
      type: Date,
      default: Date.now,
    },
    referrer: {
      type: String,
      default: '',
      trim: true,
    },
    device: {
      type: String,
      default: 'unknown',
      trim: true,
    },
    browser: {
      type: String,
      default: 'unknown',
      trim: true,
    },
    country: {
      type: String,
      default: 'unknown',
      trim: true,
    },
    city: {
      type: String,
      default: 'unknown',
      trim: true,
    },
    source: {
      type: String,
      enum: ['direct', 'qr'],
      default: 'direct',
      required: true,
    },
    visitorHash: {
      type: String,
      default: '',
      trim: true,
    },
  },
  { timestamps: true }
);

clickEventSchema.index({ link: 1, clickedAt: -1 });

const ClickEvent = mongoose.model('ClickEvent', clickEventSchema);

export { ClickEvent };

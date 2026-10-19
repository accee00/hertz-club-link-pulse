import mongoose from 'mongoose';

const linkSchema = new mongoose.Schema(
  {
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true,
    },
    campaign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign',
      default: null,
      index: true,
    },
    shortCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    destinationUrl: {
      type: String,
      required: true,
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
      lowercase: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['active', 'disabled'],
      default: 'active',
      required: true,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    clickLimit: {
      type: Number,
      default: null,
      min: 1,
    },
    passwordHash: {
      type: String,
      default: null,
      select: false,
    },
    totalClicks: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

linkSchema.index({ workspace: 1, createdAt: -1 });
linkSchema.index({ campaign: 1, createdAt: -1 });

const Link = mongoose.model('Link', linkSchema);

export { Link };

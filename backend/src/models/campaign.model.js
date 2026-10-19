
import mongoose from 'mongoose';

const campaignSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

campaignSchema.index({ workspace: 1, createdAt: -1 });

const Campaign = mongoose.model('Campaign', campaignSchema);

export { Campaign };

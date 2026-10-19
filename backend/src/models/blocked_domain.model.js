import mongoose from 'mongoose';

const blockedDomainSchema = new mongoose.Schema(
  {
    domain: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
  },
  { timestamps: true }
);

const BlockedDomain = mongoose.model('BlockedDomain', blockedDomainSchema);

export { BlockedDomain };

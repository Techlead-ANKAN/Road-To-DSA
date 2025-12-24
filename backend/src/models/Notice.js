import mongoose from 'mongoose';

const noticeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    deadline: {
      type: Date,
      default: null,
    },
    noticeLevel: {
      type: String,
      required: true,
      enum: ['high', 'medium', 'low'],
      default: 'medium',
    },
    isDone: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for query optimization
noticeSchema.index({ userId: 1, isDone: 1 });
noticeSchema.index({ userId: 1, deadline: 1 });

const Notice = mongoose.model('Notice', noticeSchema);

export default Notice;

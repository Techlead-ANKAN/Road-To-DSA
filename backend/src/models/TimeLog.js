import mongoose from 'mongoose'

const timeEntrySchema = new mongoose.Schema(
  {
    startTime: {
      type: String,
      required: true,
      trim: true,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, // HH:MM format
    },
    endTime: {
      type: String,
      required: true,
      trim: true,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, // HH:MM format
    },
    durationMinutes: {
      type: Number,
      required: true,
      min: 1,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },
    category: {
      type: String,
      enum: ['work', 'study', 'meeting', 'break'],
      default: 'work',
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { _id: true }
);

const timeLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    entries: [timeEntrySchema],
    totalMinutes: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index to ensure one log per user per day
timeLogSchema.index({ userId: 1, date: 1 }, { unique: true });

// Method to calculate total minutes
timeLogSchema.methods.calculateTotalMinutes = function () {
  this.totalMinutes = this.entries.reduce(
    (sum, entry) => sum + entry.durationMinutes,
    0
  );
  return this.totalMinutes;
};

// Pre-save hook to auto-calculate total minutes
timeLogSchema.pre('save', function (next) {
  this.calculateTotalMinutes();
  next();
});

const TimeLog = mongoose.model('TimeLog', timeLogSchema);

export default TimeLog

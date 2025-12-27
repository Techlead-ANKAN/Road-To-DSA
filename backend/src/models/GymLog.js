import mongoose from 'mongoose';

const performedExerciseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['count', 'time'],
      required: true,
    },
    // For count-based exercises - array of sets performed
    sets: [
      {
        reps: Number,
        weight: Number,
      },
    ],
    // For time-based exercises
    time: {
      type: Number, // in minutes
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  { _id: true }
);

const gymLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    workoutDayId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WorkoutDay',
      required: true,
    },
    exercises: [performedExerciseSchema],
    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index for efficient queries and ensure one log per day per user
gymLogSchema.index({ userId: 1, date: 1 }, { unique: true });

const GymLog = mongoose.model('GymLog', gymLogSchema);

export default GymLog;

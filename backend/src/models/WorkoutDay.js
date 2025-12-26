import mongoose from 'mongoose';

const exerciseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['count', 'time'],
      required: true,
    },
    category: {
      type: String,
      enum: ['warmup', 'main', 'cardio'],
      default: 'main',
    },
    order: {
      type: Number,
      default: 0,
    },
    // For count-based exercises (e.g., bench press)
    defaultSets: {
      type: Number,
      min: 0,
    },
    defaultReps: {
      type: Number,
      min: 0,
    },
    defaultWeight: {
      type: Number,
      min: 0,
    },
    // For time-based exercises (e.g., running)
    defaultTime: {
      type: Number, // in minutes
      min: 0,
    },
  },
  { _id: true }
);

const workoutDaySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    exercises: [exerciseSchema],
  },
  {
    timestamps: true,
  }
);

const WorkoutDay = mongoose.model('WorkoutDay', workoutDaySchema);

export default WorkoutDay;

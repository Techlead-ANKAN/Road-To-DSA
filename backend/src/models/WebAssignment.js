import mongoose from 'mongoose';

const webAssignmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    solutions: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        htmlCode: {
          type: String,
          default: '',
        },
        cssCode: {
          type: String,
          default: '',
        },
        jsCode: {
          type: String,
          default: '',
        },
        completed: {
          type: Boolean,
          default: false,
        },
        completedAt: {
          type: Date,
          default: null,
        },
        lastUpdated: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
webAssignmentSchema.index({ title: 1 });
webAssignmentSchema.index({ tags: 1 });
webAssignmentSchema.index({ 'solutions.userId': 1 });

const WebAssignment = mongoose.model('WebAssignment', webAssignmentSchema);

export default WebAssignment;

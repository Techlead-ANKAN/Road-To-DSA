import mongoose from 'mongoose'

const ProgressProblemSchema = new mongoose.Schema(
  {
    problem_index: { type: Number, required: true },
    problem_name: { type: String, required: true },
    difficulty: { type: String, required: true },
    leetcode_link: { type: String, default: '' },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
    code: { type: String, default: '' },
    codeLang: { type: String, default: 'cpp' },
    notes: { type: String, default: '' }
  },
  { _id: false }
)

const ProgressTopicSchema = new mongoose.Schema(
  {
    topic_index: { type: Number, required: true },
    topic_name: { type: String, required: true },
    problems: { type: [ProgressProblemSchema], default: [] }
  },
  { _id: false }
)

const ProgressStepSchema = new mongoose.Schema(
  {
    step_index: { type: Number, required: true },
    step_name: { type: String, required: true },
    topics: { type: [ProgressTopicSchema], default: [] }
  },
  { _id: false }
)

const ProgressSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    steps: { type: [ProgressStepSchema], default: [] }
  },
  { timestamps: true }
)

ProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true })
ProgressSchema.index({ userId: 1 })
ProgressSchema.index({ courseId: 1 })

export const Progress = mongoose.model('Progress', ProgressSchema)

import mongoose from 'mongoose'

const ProblemSchema = new mongoose.Schema(
  {
    problem_index: { type: Number, required: true },
    problem_name: { type: String, required: true },
    difficulty: { type: String, required: true },
    leetcode_link: { type: String, default: '' }
  },
  { _id: false }
)

const TopicSchema = new mongoose.Schema(
  {
    topic_index: { type: Number, required: true },
    topic_name: { type: String, required: true },
    progress: { type: String, default: '' },
    problems: { type: [ProblemSchema], default: [] }
  },
  { _id: false }
)

const StepSchema = new mongoose.Schema(
  {
    step_index: { type: Number, required: true },
    step_name: { type: String, required: true },
    progress: { type: String, default: '' },
    topics: { type: [TopicSchema], default: [] },
    total_problems: { type: Number, default: 0 }
  },
  { _id: false }
)

const CourseSchema = new mongoose.Schema(
  {
    course_name: { type: String, required: true },
    description: { type: String, required: true },
    steps: { type: [StepSchema], default: [] },
    metadata: { type: mongoose.Schema.Types.Mixed, default: null },
    statistics: { type: mongoose.Schema.Types.Mixed, default: null },
    summary: { type: mongoose.Schema.Types.Mixed, default: null },
    raw_source: { type: mongoose.Schema.Types.Mixed, required: true }
  },
  { timestamps: true }
)

CourseSchema.index({ course_name: 1 }, { unique: true })

export const Course = mongoose.model('Course', CourseSchema)

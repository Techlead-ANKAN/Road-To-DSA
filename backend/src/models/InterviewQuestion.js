import mongoose from 'mongoose'

const interviewQuestionSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
      index: true
    },
    question: {
      type: String,
      required: [true, 'Question is required'],
      trim: true
    },
    answer: {
      type: String,
      required: [true, 'Answer is required']
    },
    answerFormat: {
      type: String,
      enum: ['text', 'code', 'markdown'],
      default: 'text',
      required: true
    },
    tags: {
      type: [String],
      default: [],
      index: true
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard', ''],
      default: ''
    },
    order: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
)

// Compound index for efficient queries by subject and tags
interviewQuestionSchema.index({ subject: 1, tags: 1 })
interviewQuestionSchema.index({ subject: 1, order: 1 })

const InterviewQuestion = mongoose.model('InterviewQuestion', interviewQuestionSchema)

export default InterviewQuestion

import mongoose from 'mongoose'

const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Subject name is required'],
      trim: true,
      unique: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    order: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
)

subjectSchema.index({ name: 1 })

const Subject = mongoose.model('Subject', subjectSchema)

export default Subject

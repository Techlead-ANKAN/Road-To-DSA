import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String },
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
)

UserSchema.index({ email: 1 }, { unique: true })

export const User = mongoose.model('User', UserSchema)

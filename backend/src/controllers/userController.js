import { User } from '../models/User.js'

export const createUser = async (req, res) => {
  const { name, email } = req.body || {}

  if (!name || !email) {
    const error = new Error('name and email are required')
    error.statusCode = 400
    throw error
  }

  const normalizedEmail = String(email).toLowerCase().trim()

  let user = await User.findOne({ email: normalizedEmail })
  let isNew = false

  if (!user) {
    user = await User.create({
      name: name.trim(),
      email: normalizedEmail
    })
    isNew = true
  } else if (user.name !== name.trim()) {
    user.name = name.trim()
    await user.save()
  }

  res.status(isNew ? 201 : 200).json({
    userId: user._id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt
  })
}

export const getUser = async (req, res) => {
  const { userId } = req.params

  const user = await User.findById(userId)
  if (!user) {
    const error = new Error('User not found')
    error.statusCode = 404
    throw error
  }

  res.json({
    userId: user._id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt
  })
}

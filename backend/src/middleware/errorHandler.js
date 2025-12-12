export const notFoundHandler = (req, res, next) => {
  res.status(404).json({ message: 'Resource not found' })
}

export const errorHandler = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  const status = err.statusCode || 500
  const message = err.message || 'Internal server error'
  const details = err.details || undefined

  if (req.app.get('env') !== 'production') {
    console.error(err)
  }

  res.status(status).json({
    message,
    ...(details ? { details } : {})
  })
}

export const notFoundHandler = (req, res, next) => {
  res.status(404).json({ message: 'Resource not found' })
}

export const errorHandler = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  const status = err.statusCode || 500
  const message = err.message || 'Internal server error'
  const details = err.details || undefined

  // Always log errors for debugging (but sanitize in production logs)
  console.error('Error occurred:', {
    status,
    message,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  })
  
  if (req.app.get('env') !== 'production') {
    console.error('Full error stack:', err)
  } else {
    console.error('Error name:', err.name)
  }

  res.status(status).json({
    message,
    ...(details ? { details } : {})
  })
}

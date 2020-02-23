const AUTH_TOKEN = process.env.AUTH_TOKEN || 'some-token'

exports.auth = (req, res, next) => {
  try {
    const token = req.header('X-TOKEN')
    if (token === undefined || token !== AUTH_TOKEN) {
      throw new Error('Unable to authenticate')
    }
    next()
  } catch (e) {
    res.status(401).json({
      error: e
    })
  }
}

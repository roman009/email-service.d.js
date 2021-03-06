const AUTH_TOKEN = process.env.AUTH_TOKEN

const auth = (req, res, next) => {
  try {
    const token = req.header('X-TOKEN')
    if (token === undefined || token !== AUTH_TOKEN) {
      throw new Error('Unable to authenticate')
    }
    return next()
  } catch (e) {
    return res.status(401).json({
      error: e.toString()
    })
  }
}

exports.middleware = auth

const schema = require('../validation/web_request')
const { PubSub } = require('@google-cloud/pubsub')

const pubSubClient = new PubSub({ projectId: process.env.GOOGLE_PROJECT_ID || 'email-service-d' })
const TOPIC_WEB_REQUESTS = process.env.TOPIC_WEB_REQUESTS || 'topic-web-requests'

exports.send = async (req, res, next) => {
  const { error, value } = schema.validate(req.body)
  if (error !== undefined && error) {
    console.log(error)
    res.status(422).json(error.details)
    return next()
  }

  const dataBuffer = Buffer.from(JSON.stringify(value))
  const messageId = await pubSubClient.topic(TOPIC_WEB_REQUESTS).publish(dataBuffer)
  console.log(`Message ${messageId} published.`)

  return res.json({
    status: 'success',
    data: value
  })
}

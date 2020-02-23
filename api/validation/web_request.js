const Joi = require('joi')

const schema = Joi.object().keys({
  from: Joi.string().email().required(),
  to: Joi.array().items(Joi.string().email()).required(),
  cc: Joi.array().items(Joi.string().email()),
  bcc: Joi.array().items(Joi.string().email()),
  subject: Joi.string().required(),
  body: Joi.string().required()
})

exports.schema = schema

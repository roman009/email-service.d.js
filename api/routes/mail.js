const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const mailController = require('../controller/mail_controller')

router.post('/send', auth.middleware, mailController.send)

exports.router = router

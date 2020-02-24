const express = require('express')
const router = express.Router()
const healthController = require('../controller/health_controller')

router.get('/check', healthController.check)

exports.router = router

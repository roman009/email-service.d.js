const express = require('express')
const logger = require('morgan')
const bodyParser = require('body-parser')
const mailRouter = require('./routes/mail')

const app = express()
const PORT = process.env.PORT || 8080

app.set('port', PORT)

app.use(logger(process.env.ENV || 'dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.use('/api/mail', mailRouter)

app.listen(PORT, () => { console.log(`App running on port ${PORT}`) })

exports.app = app

const express = require('express')
const router = express.Router()
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml');

router.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

exports.router = router
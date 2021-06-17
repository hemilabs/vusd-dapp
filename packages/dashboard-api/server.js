'use strict'

const config = require('config')
const cors = require('cors')
const express = require('express')
const helmet = require('helmet')
const morgan = require('morgan')
const split = require('split')
const logger = require('./src/logger')(config.get('logger'))
const { getAddressInfo } = require('./src/ethplorer')

// Force libraries debug output through winston
process.stderr.write = function (message) {
  logger.debug(message.substring(25, message.length - 1))
}

const app = express()

app.use(helmet())

app.use(
  cors({
    origin: config.get('cors.origin').map((str) => new RegExp(str))
  })
)

app.use(
  morgan('dev', {
    stream: split().on('data', function (message) {
      logger.verbose('<-- %s', message)
    })
  })
)

app.get('/info/:address', (req, res) =>
  getAddressInfo(req.params.address).then((response) => res.send(response))
)

// eslint-disable-next-line no-unused-vars
app.use(function (err, req, res, next) {
  logger.warn('Internal error %s', err)
  res.status(500).json({
    status: 500,
    title: 'Internal Server Error',
    detail: process.env.NODE_ENV === 'production' ? undefined : err.stack
  })
})

const port = config.get('port')
app.listen(port, function () {
  logger.info('Server started in port %s', port)
})

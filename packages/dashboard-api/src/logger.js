'use strict'

const { PapertrailTransport } = require('winston-papertrail-transport')
const winston = require('winston')

const createLogger = function (config) {
  const transports = [new winston.transports.Console(config.Console)]

  if (config.Papertrail.host) {
    transports.push(new PapertrailTransport(config.Papertrail))
  }

  return winston.createLogger({
    format: winston.format.combine(
      winston.format.splat(),
      winston.format.colorize(),
      winston.format.simple()
    ),
    transports
  })
}

module.exports = createLogger

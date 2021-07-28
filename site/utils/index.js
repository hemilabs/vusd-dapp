'use strict'

const Big = require('big.js')

const fromUnit = (number, decimals = 18) =>
  Big(`${Big(number).toFixed()}e-${decimals}`).toFixed()

const ONLY_NUMBERS_REGEX = /^([0-9]\d*(\.)\d*|0?(\.)\d*[0-9]\d*|[0-9]\d*)$/
const toUnit = (number, decimals = 18) =>
  Big(`${Big(number).toFixed()}e+${decimals}`).toFixed(0)

const toFixed = (number, decimals) => Big(number).toFixed(decimals)

module.exports = {
  fromUnit,
  ONLY_NUMBERS_REGEX,
  toUnit,
  toFixed
}

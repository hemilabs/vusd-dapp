'use strict'

const Big = require('big.js')

/**
 * @param {string} number
 * @param {number} decimals
 * @param {number} [outputDecimals]
 */
const fromUnit = (number, decimals = 18, outputDecimals) =>
  new Big(`${new Big(number).toFixed()}e-${decimals}`).toFixed(outputDecimals)

/**
 * @param {string} number
 * @param {number} decimals
 */
const toUnit = (number, decimals = 18) =>
  new Big(`${new Big(number).toFixed()}e+${decimals}`).toFixed(0)

module.exports = {
  fromUnit,
  toUnit
}

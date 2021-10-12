import Big from 'big.js'

export const fromUnit = (number, decimals = 18) =>
  Big(`${Big(number).toFixed()}e-${decimals}`).toFixed()

export const toUnit = (number, decimals = 18) =>
  Big(`${Big(number).toFixed()}e+${decimals}`).toFixed(0)

export const format = value =>
  new Intl.NumberFormat('default', {
    maximumFractionDigits: 6,
    minimumFractionDigits: 2
  }).format(value)

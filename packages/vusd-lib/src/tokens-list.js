'use strict'

const { tokens } = require('@uniswap/default-token-list')

const contracts = require('./contracts.json')

const vusd = {
  address: contracts.VUSD,
  symbol: 'VUSD',
  decimals: 18,
  chainId: 1
}
const allTokens = [vusd].concat(tokens)

const findByAddress = (address, chainId = 1) =>
  allTokens.find((t) => t.address === address && t.chainId === chainId)

const findBySymbol = (symbol, chainId = 1) =>
  allTokens.find((t) => t.symbol === symbol && t.chainId === chainId)

module.exports = { findByAddress, findBySymbol }

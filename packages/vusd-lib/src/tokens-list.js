'use strict'

const { tokens } = require('@uniswap/default-token-list')

const contracts = require('./contracts.json')

const vusdToken = {
  address: /** @type {`0x${string}`} */ (contracts.VUSD),
  chainId: 1,
  decimals: 18,
  logoURI: 'https://hemilabs.github.io/token-list/logos/vusd.svg',
  name: 'VUSD',
  symbol: 'VUSD'
}

const allTokens = tokens.concat(vusdToken)

const findByAddress = (address, chainId = 1) =>
  allTokens.find(t => t.address === address && t.chainId === chainId)

const findBySymbol = (symbol, chainId = 1) =>
  allTokens.find(t => t.symbol === symbol && t.chainId === chainId)

module.exports = { findByAddress, findBySymbol, vusdToken }

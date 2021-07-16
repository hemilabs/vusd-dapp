'use strict'

const { tokens } = require('@uniswap/default-token-list')

const contracts = require('./contracts.json')

const vusd = {
  name: 'VUSD',
  address: contracts.VUSD,
  symbol: 'VUSD',
  decimals: 18,
  chainId: 1,
  logoURI: ''
}

const VUSD3CRV = {
  name: 'VUSD3CRV-f',
  address: contracts.CurveMetapool,
  symbol: 'VUSD3CRV-f',
  decimals: 18,
  chainId: 1,
  logoURI: ''
}

const allTokens = [VUSD3CRV].concat([vusd].concat(tokens))

const findByAddress = (address, chainId = 1) =>
  allTokens.find((t) => t.address === address && t.chainId === chainId)

const findBySymbol = (symbol, chainId = 1) =>
  allTokens.find((t) => t.symbol === symbol && t.chainId === chainId)

module.exports = { findByAddress, findBySymbol }

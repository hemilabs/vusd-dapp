'use strict'

const { tokens } = require('@uniswap/default-token-list')

const contracts = require('./contracts.json')

const vusd = {
  address: contracts.VUSD,
  chainId: 1,
  decimals: 18,
  logoURI: '',
  name: 'VUSD',
  symbol: 'VUSD'
}

const VUSD3CRV = {
  address: contracts.CurveMetapool,
  chainId: 1,
  decimals: 18,
  logoURI: '',
  name: 'VUSD3CRV-f',
  symbol: 'VUSD3CRV-f'
}

const allTokens = [VUSD3CRV].concat([vusd].concat(tokens))

const findByAddress = (address, chainId = 1) =>
  allTokens.find((t) => t.address === address && t.chainId === chainId)

const findBySymbol = (symbol, chainId = 1) =>
  allTokens.find((t) => t.symbol === symbol && t.chainId === chainId)

module.exports = { findByAddress, findBySymbol }

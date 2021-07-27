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

const triToken = {
  address: '0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490',
  chainId: 1,
  decimals: 18,
  name: 'Curve.fi DAI/USDC/USDT',
  symbol: '3Crv'
}

const allTokens = [triToken].concat([VUSD3CRV].concat([vusd].concat(tokens)))

const findByAddress = (address, chainId = 1) =>
  allTokens.find((t) => t.address === address && t.chainId === chainId)

const findBySymbol = (symbol, chainId = 1) =>
  allTokens.find((t) => t.symbol === symbol && t.chainId === chainId)

module.exports = { findByAddress, findBySymbol }

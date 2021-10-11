'use strict'

const { tokens } = require('@uniswap/default-token-list')
const contracts = require('./contracts.json')
const poolTokens = [
  {
    address: contracts.VUSD,
    chainId: 1,
    decimals: 18,
    logoURI:
      'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
    name: 'VUSD',
    symbol: 'VUSD'
  },
  {
    address: contracts.CurveMetapool,
    chainId: 1,
    decimals: 18,
    logoURI: '',
    name: 'VUSD3CRV-f',
    symbol: 'VUSD3CRV-f'
  }
]

const allTokens = poolTokens.concat(tokens)

const findByAddress = (address, chainId = 1) =>
  allTokens.find(t => t.address === address && t.chainId === chainId)

const findBySymbol = (symbol, chainId = 1) =>
  allTokens.find(t => t.symbol === symbol && t.chainId === chainId)

module.exports = { findByAddress, findBySymbol }

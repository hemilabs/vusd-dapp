'use strict'

const uniswapV2Router02Abi = require('./uniswap-v2-router-02.json')

const uniswapV2Router02Address = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'

const createUniswapRouter = web3 =>
  new web3.eth.Contract(uniswapV2Router02Abi, uniswapV2Router02Address)

module.exports = createUniswapRouter

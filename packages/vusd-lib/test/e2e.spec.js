'use strict'

require('chai').should()

const Big = require('big.js').default
const erc20Abi = require('erc-20-abi')
const Web3 = require('web3')

const { findBySymbol } = require('../src/tokens-list')
const { toUnit } = require('../src/utils')
const createUniswapRouter = require('./helpers/uniswap')
const testProvider = require('./helpers/test-provider')

const createVusdLib = require('..')
const fixtures = require('./fixtures.json')

describe('End-to-end', function () {
  before(function () {
    if (!process.env.E2E) {
      this.skip()
      return
    }
  })

  //
  // This commented code helps record Ethereum RPC calls with easy. Just change
  // the Web3 provider used in any test to `recProvider`.
  //
  this.timeout(0)
  let provider
  beforeEach(function () {
    provider = () => testProvider([], true)
  })
  // afterEach(function () {
  //   const calls = recProvider.getCalls()
  //   if (calls.length) {
  //     console.log('RECORDED CALLS:')
  //     console.log(JSON.stringify(calls))
  //   }
  // })

  it('should get the list of whitelisted tokens', function () {
    const calls = fixtures.getWhitelistedTokens
    // @ts-ignore ts(2351)
    const web3 = new Web3(provider(calls))
    const vusdLib = createVusdLib(web3)
    return vusdLib.getTokens().then(function (tokens) {
      tokens.should.be.an('array')
      tokens.forEach(function (token) {
        if (token.mintable) {
          token.mintable.should.be.true
          token.mintingFee.should.be.a('number').that.is.within(0, 1)
        }
        if (token.redeemable) {
          token.redeemable.should.be.true
          token.redeemFee.should.be.a('number').that.is.within(0, 1)
          token.redeemableVusd.should.be.a('string').that.matches(/^[0-9]+$/)
        }
        token.should.include.all.keys(['address', 'name', 'symbol', 'decimals'])
      })
    })
  })

  it("should get the user's balances", function () {
    const calls = fixtures.getUserBalances
    // @ts-ignore ts(2351)
    const web3 = new Web3(provider(calls))
    const vusdLib = createVusdLib(web3)
    return vusdLib
      .getUserBalances(fixtures.testAccount)
      .then(function (balances) {
        balances.should.be.an('array')
        balances.forEach(function (balance) {
          balance.should.have
            .property('address')
            .that.is.a('string')
            .that.matches(/^0x[0-9a-fA-F]{40}$/)
          balance.should.have
            .property('balance')
            .that.is.a('string')
            .that.matches(/^[0-9]+$/)
        })
      })
  })

  it("should get the user's VUSD balance", function () {
    const calls = fixtures.getVusdBalance
    // @ts-ignore ts(2351)
    const web3 = new Web3(provider(calls))
    const vusdLib = createVusdLib(web3)
    return vusdLib
      .getVusdBalance(fixtures.testAccount)
      .then(function (balance) {
        balance.should.be.a('string').that.matches(/^[0-9]+$/)
      })
  })

  it('should mint from DAI', function () {
    const calls = fixtures.mint
    const from = fixtures.from
    // @ts-ignore ts(2351)
    const web3 = new Web3(provider(calls))
    const vusdLib = createVusdLib(web3, { from })
    const uniswap = createUniswapRouter(web3)
    // Swap ETH for DAI
    const { address, decimals } = findBySymbol('DAI')
    const token = new web3.eth.Contract(erc20Abi, address)
    const ONE_ETH = '1000000000000000000'
    return uniswap.methods
      .swapExactETHForTokens(
        1,
        [fixtures.wethAddress, address],
        from,
        2000000000 // 2033-05-18T03:33:20.000Z
      )
      .send({ from, gas: 200000, value: ONE_ETH })
      .then(function (receipt) {
        receipt.status.should.be.true
        // Get DAI and VUSD balances
        return Promise.all([
          token.methods.balanceOf(from).call(),
          vusdLib.getVusdBalance(from)
        ])
      })
      .then(function ([daiBalance, vusdBalance]) {
        // Check DAI balance
        daiBalance.should.be
          .a('string')
          .that.that.matches(/^[0-9]+$/)
          .and.not.equals('0')
        // Mint VUSD from DAI
        return Promise.all([
          daiBalance,
          vusdBalance,
          vusdLib.mint(address, toUnit('10', decimals)).promise
        ])
      })
      .then(function ([daiBalance, vusdBalance, result]) {
        // Check the mint op succedded
        result.status.should.be.true
        // Check sent and received
        result.sent.should.equals(toUnit('10', decimals))
        result.received.should.equals(toUnit('10'))
        // Get DAI and VUSD balances
        return Promise.all([
          daiBalance,
          vusdBalance,
          token.methods.balanceOf(from).call(),
          vusdLib.getVusdBalance(from)
        ])
      })
      .then(function ([
        oldDaiBalance,
        oldVusdBalance,
        newDaiBalance,
        newVusdBalance
      ]) {
        // Check DAI balance
        new Big(oldDaiBalance)
          .minus(newDaiBalance)
          .toFixed()
          .should.equals(toUnit('10', decimals))
        // Check VUSD balance
        new Big(newVusdBalance)
          .minus(oldVusdBalance)
          .toFixed()
          .should.equals(toUnit('10'))
      })
  })

  it('should redeem from USDC', function () {
    const calls = fixtures.redeem
    const from = fixtures.from
    // @ts-ignore ts(2351)
    const web3 = new Web3(provider(calls))
    const vusdLib = createVusdLib(web3, { from })
    const uniswap = createUniswapRouter(web3)
    // swap ETH for USDC
    const { address, decimals } = findBySymbol('USDC')
    const token = new web3.eth.Contract(erc20Abi, address)
    const ONE_ETH = '1000000000000000000'
    return (
      uniswap.methods
        .swapExactETHForTokens(
          1,
          [fixtures.wethAddress, address],
          from,
          2000000000 // 2033-05-18T03:33:20.000Z
        )
        .send({ from, gas: 200000, value: ONE_ETH })
        .then(function (receipt) {
          receipt.status.should.be.true
          // Get USDC balance
          return token.methods.balanceOf(from).call()
        })
        .then(function (usdcBalance) {
          // Check USDC balance
          usdcBalance.should.be
            .a('string')
            .that.that.matches(/^[0-9]+$/)
            .and.not.equals('0')
          // Mint VUSD from USDC
          return vusdLib.mint(address, toUnit('10', decimals)).promise
        })
        .then(function (result) {
          // Check the mint op succedded
          result.status.should.be.true
          // Get USDC and VUSD balances
          return Promise.all([
            token.methods.balanceOf(from).call(),
            vusdLib.getVusdBalance(from)
          ])
        })
        // Redeem USDC from VUSD
        .then(([usdcBalance, vusdBalance]) =>
          Promise.all([
            usdcBalance,
            vusdBalance,
            vusdLib.redeem(address, toUnit('10')).promise,
            vusdLib.getRedeemFee()
          ])
        )
        .then(function ([usdcBalance, vusdBalance, result, redeemFee]) {
          // Check the redeem op succedded
          result.status.should.be.true
          // Check sent and received
          result.sent.should.equals(toUnit('10'))
          result.received.should.equals(toUnit(10 * (1 - redeemFee), decimals))
          // Get USDC and VUSD balances
          return Promise.all([
            usdcBalance,
            vusdBalance,
            token.methods.balanceOf(from).call(),
            vusdLib.getVusdBalance(from),
            redeemFee
          ])
        })
        .then(function ([
          oldUsdcBalance,
          oldVusdBalance,
          newUsdcBalance,
          newVusdBalance,
          redeemFee
        ]) {
          // Check USDC balance
          new Big(newUsdcBalance)
            .minus(oldUsdcBalance)
            .toFixed()
            .should.equals(toUnit(10 * (1 - redeemFee), decimals))
          // Check VUSD balance
          new Big(oldVusdBalance)
            .minus(newVusdBalance)
            .toFixed()
            .should.equals(toUnit('10'))
        })
    )
  })
})

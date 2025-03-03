'use strict'

const Big = require('big.js').default
const debug = require('debug')('vusd-lib')
const erc20Abi = require('erc-20-abi')
const parseReceiptEvents = require('web3-parse-receipt-events')

const { findByAddress, findBySymbol } = require('./tokens-list')
const { fromUnit, toUnit } = require('./utils')
const contracts = require('./contracts.json')
const createExecutor = require('./exec-transactions')
const minterAbi = require('./abi/Minter.json')
const redeemerAbi = require('./abi/Redeemer.json')
const treasuryAbi = require('./abi/Treasury.json')
const vusdAbi = require('./abi/VUSD.json')
const unionBy = require('./union-by')

const createVusdLib = function (web3, options = {}) {
  const { from } = options

  const vusd = new web3.eth.Contract(vusdAbi, contracts.VUSD)

  const getMinterContract = () =>
    vusd.methods
      .minter()
      .call()
      .then(address => new web3.eth.Contract(minterAbi, address))
  const getTreasuryContract = () =>
    vusd.methods
      .treasury()
      .call()
      .then(address => new web3.eth.Contract(treasuryAbi, address))
  const getRedeemerContract = () =>
    getTreasuryContract()
      .then(treasury => treasury.methods.redeemer().call())
      .then(address => new web3.eth.Contract(redeemerAbi, address))

  const getMinterWhitelistedTokens = function () {
    debug('Getting Minter whitelisted tokens')
    return getMinterContract()
      .then(minter => minter.methods.whitelistedTokens().call())
      .then(addresses => addresses.map(a => findByAddress(a)))
      .then(function (tokens) {
        debug('Minter tokens are %s', tokens.map(t => t.symbol).join(', '))
        return tokens
      })
  }

  const getTreasuryWhitelistedTokens = function () {
    debug('Getting Treasury whitelisted tokens')
    return getTreasuryContract()
      .then(treasury => treasury.methods.whitelistedTokens().call())
      .then(addresses => addresses.map(a => findByAddress(a)))
      .then(function (tokens) {
        debug('Treasury tokens are %s', tokens.map(t => t.symbol).join(', '))
        return tokens
      })
  }

  // Checks if an approval is needed to mint from the the given token amount.
  const isApprovalNeeded = function (token, owner, spender, amount) {
    const { decimals, symbol } = findByAddress(token)
    debug(
      'Checking if approval is needed for %s %s',
      fromUnit(amount, decimals),
      symbol
    )
    const contract = new web3.eth.Contract(erc20Abi, token)
    return contract.methods
      .allowance(owner, spender)
      .call()
      .then(function (allowance) {
        debug('Allowance for %s is %s', symbol, fromUnit(allowance, decimals))
        const approvalNeeded = new Big(allowance).lt(amount)
        debug('Approval is %s', approvalNeeded ? 'needed' : 'not needed')
        return approvalNeeded
      })
  }

  const addRedeemableBalance = function (token) {
    const { address, decimals, symbol } = token
    debug('Getting redeemable balance of %s', symbol)
    return getRedeemerContract()
      .then(redeemer => redeemer.methods.redeemable(address).call())
      .then(function (redeemable) {
        const redeemableVusd = toUnit(redeemable, 18 - decimals)
        debug(
          'Redeemable balance is %s VUSD from %s',
          fromUnit(redeemableVusd),
          symbol
        )
        return {
          ...token,
          redeemableVusd
        }
      })
  }

  const addRedeemableBalances = tokens =>
    Promise.all(tokens.map(addRedeemableBalance))

  const getMintingFee = function () {
    debug('Getting minting fee')
    return getMinterContract()
      .then(minter => minter.methods.mintingFee().call())
      .then(function (response) {
        const fee = Number.parseInt(response) / 10000
        debug('Minting fee is %s%', (fee * 100).toFixed(2))
        return fee
      })
  }

  const getRedeemFee = function () {
    debug('Getting redeem fee')
    return getRedeemerContract()
      .then(redeemer => redeemer.methods.redeemFee().call())
      .then(function (response) {
        const fee = Number.parseInt(response) / 10000
        debug('Redeem fee is %s%', (fee * 100).toFixed(2))
        return fee
      })
  }

  const getTokens = function () {
    debug('Getting tokens information')
    return Promise.all([
      getMinterWhitelistedTokens(),
      getTreasuryWhitelistedTokens().then(addRedeemableBalances),
      getMintingFee(),
      getRedeemFee()
    ]).then(([mintableTokens, redeemableTokens, mintingFee, redeemFee]) =>
      unionBy(
        [
          mintableTokens.map(t => ({ ...t, mintable: true, mintingFee })),
          redeemableTokens.map(t => ({ ...t, redeemable: true, redeemFee }))
        ],
        t => t.address,
        (a, b) => ({ ...a, ...b })
      )
    )
  }

  const getVusdBalance = function (owner = from) {
    debug('Getting VUSD balance of %s', owner)
    return vusd.methods
      .balanceOf(owner)
      .call()
      .then(function (balance) {
        debug('Balance of %s is %s VUSD', owner, fromUnit(balance))
        return balance
      })
  }

  const execOptions = { from, web3, overestimation: 2 }
  const executeTransactions = createExecutor(execOptions)

  const findReturnValue = (receipt, eventName, prop, address) =>
    []
      .concat(receipt.events[eventName])
      .filter(event => event.address.toLowerCase() === address.toLowerCase())
      .map(event => event.returnValues[prop])[0]

  const getVusdSupply = function () {
    debug('Getting VUSD supply')
    return vusd.methods
      .totalSupply()
      .call()
      .then(function (totalSupply) {
        debug('Total VUSD supply is %s VUSD', fromUnit(totalSupply))
        return totalSupply
      })
  }

  const getUserBalances = function (owner = from) {
    debug('Getting token balances of %s', owner)
    return getMinterWhitelistedTokens().then(whitelistedTokens =>
      Promise.all(
        whitelistedTokens.map(function (token) {
          const { address, symbol, decimals } = token
          const contract = new web3.eth.Contract(erc20Abi, address)
          return contract.methods
            .balanceOf(owner)
            .call()
            .then(function (balance) {
              debug(
                'Balance of %s is %s %s',
                owner,
                fromUnit(balance, decimals),
                symbol
              )
              return { address, balance }
            })
        })
      )
    )
  }

  // Mints VUSD. The amount is token.
  const mint = function (token, amount, transactionOptions = {}) {
    const { decimals, symbol } = findByAddress(token)
    debug('Minting %s VUSD from %s', fromUnit(amount, decimals), symbol)
    const owner = transactionOptions.from || from
    const transactionsPromise = getMinterContract()
      .then(minter =>
        Promise.all([
          minter,
          isApprovalNeeded(token, owner, minter.options.address, amount)
        ])
      )
      .then(function ([minter, approvalNeeded]) {
        const txs = []
        if (approvalNeeded) {
          const contract = new web3.eth.Contract(erc20Abi, token)
          txs.push({
            method: contract.methods.approve(minter.options.address, amount),
            suffix: 'approve',
            gas: 66000
          })
        }
        txs.push({
          method: minter.methods.mint(token, amount),
          suffix: 'mint',
          gas: 100000
        })
        return txs
      })
    const parseResults = function (transactionsData) {
      const { receipt } = transactionsData[transactionsData.length - 1]
      // @ts-ignore ts(2345)
      parseReceiptEvents(erc20Abi, contracts.VUSD, receipt)
      const sent = amount
      const received = findReturnValue(
        receipt,
        'Transfer',
        'value',
        contracts.VUSD
      )
      debug(
        'Mint of VUSD from %s %s completed',
        fromUnit(amount, decimals),
        symbol
      )
      debug('Received %s VUSD', fromUnit(received))
      return { sent, received }
    }
    return executeTransactions(
      transactionsPromise,
      parseResults,
      transactionOptions
    )
  }

  // Redeems a token by burning VUSD. The amount is VUSD.
  const redeem = function (
    token,
    amount,
    tokenReceiver,
    transactionOptions = {}
  ) {
    const { decimals, symbol } = findByAddress(token)
    debug('Redeeming %s VUSD from %s', fromUnit(amount), symbol)
    const owner = transactionOptions.from || from
    const transactionsPromise = getRedeemerContract()
      .then(redeemer =>
        Promise.all([
          redeemer,
          isApprovalNeeded(
            contracts.VUSD,
            owner,
            redeemer.options.address,
            amount
          )
        ])
      )
      .then(function ([redeemer, approvalNeeded]) {
        const txs = []
        if (approvalNeeded) {
          txs.push({
            method: vusd.methods.approve(redeemer.options.address, amount),
            suffix: 'approve',
            gas: 66000
          })
        }
        txs.push({
          method: redeemer.methods.redeem(token, amount, tokenReceiver || from),
          suffix: 'redeem',
          gas: 100000
        })
        return txs
      })
    const parseResults = function (transactionsData) {
      const { receipt } = transactionsData[transactionsData.length - 1]
      // @ts-ignore ts(2345)
      parseReceiptEvents(erc20Abi, token, receipt)
      const sent = amount
      const received = findReturnValue(receipt, 'Transfer', 'value', token)
      debug('Redeem of %s from %s VUSD completed', symbol, fromUnit(amount))
      debug('Received %s %s', fromUnit(received, decimals), symbol)
      return { sent, received }
    }
    return executeTransactions(
      transactionsPromise,
      parseResults,
      transactionOptions
    )
  }

  return {
    findByAddress,
    findBySymbol,
    getRedeemFee,
    getTokens,
    getUserBalances,
    getVusdBalance,
    getVusdSupply,
    mint,
    redeem
  }
}

createVusdLib.findByAddress = findByAddress
createVusdLib.findBySymbol = findBySymbol
module.exports = createVusdLib

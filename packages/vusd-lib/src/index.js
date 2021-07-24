'use strict'

const Big = require('big.js').default
const debug = require('debug')('vusd-lib')
const erc20Abi = require('erc-20-abi')
const parseReceiptEvents = require('web3-parse-receipt-events')

const { fromUnit, toUnit } = require('./utils')
const { findByAddress } = require('./tokens-list')
const addressListAbi = require('./abi/AddressList.json')
const contracts = require('./contracts.json')
const createExecutor = require('./exec-transactions')
const minterAbi = require('./abi/Minter.json')
const redeemerAbi = require('./abi/Redeemer.json')
const curveMetapoolAbi = require('./abi/CurveMetapool.json')

const createVusdLib = function (web3, options = {}) {
  const { from } = options
  const minter = new web3.eth.Contract(minterAbi, contracts.Minter)
  const redeemer = new web3.eth.Contract(redeemerAbi, contracts.Redeemer)
  const vusd = new web3.eth.Contract(erc20Abi, contracts.VUSD)
  const curveMetapool = new web3.eth.Contract(
    curveMetapoolAbi,
    contracts.CurveMetapool
  )

  const min_mint_amount = 1
  const getWhitelistedTokens = function () {
    debug('Getting whitelisted tokens')
    return minter.methods
      .whitelistedTokens()
      .call()
      .then(function (address) {
        debug('Whitelist address is %s', address)
        const addressList = new web3.eth.Contract(addressListAbi, address)
        return Promise.all([
          addressList,
          addressList.methods.length().call().then(Number.parseInt)
        ])
      })
      .then(function ([addressList, length]) {
        debug('Whitelist length is %s', length)
        return Promise.all(
          new Array(length).fill().map((_, i) =>
            addressList.methods
              .at(i)
              .call()
              .then((response) => response[0])
          )
        )
      })
      .then(function (addresses) {
        const whitelistedTokens = addresses.map((address) =>
          findByAddress(address)
        )
        debug(
          'Whitelisted tokens are %s',
          whitelistedTokens.map((t) => t.symbol).join(', ')
        )
        return whitelistedTokens
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
        const approvalNeeded = Big(allowance).lt(amount)
        debug('Approval is %s', approvalNeeded ? 'needed' : 'not needed')
        return approvalNeeded
      })
  }

  const getRedeemableBalances = function () {
    debug('Getting whitelisted token treasury balances')
    return getWhitelistedTokens().then(function (whitelistedTokens) {
      return Promise.all(
        whitelistedTokens.map(function (token) {
          const { address, decimals, symbol } = token
          return redeemer.methods
            .redeemable(address)
            .call()
            .then(function (redeemable) {
              const redeemableVusd = toUnit(redeemable, 18 - decimals)
              debug(
                'Redeemable balance is %s VUSD from %s',
                fromUnit(redeemableVusd),
                symbol
              )
              return {
                ...token,
                redeemable: redeemableVusd
              }
            })
        })
      )
    })
  }

  const getMintingFee = function () {
    debug('Getting minting fee')
    return minter.methods
      .mintingFee()
      .call()
      .then(function (response) {
        const fee = Number.parseInt(response) / 10000
        debug('Minting fee is %s%', (fee * 100).toFixed(2))
        return fee
      })
  }

  const getRedeemFee = function () {
    debug('Getting redeem fee')
    return redeemer.methods
      .redeemFee()
      .call()
      .then(function (response) {
        const fee = Number.parseInt(response) / 10000
        debug('Redeem fee is %s%', (fee * 100).toFixed(2))
        return fee
      })
  }

  const execOptions = { from, web3, overestimation: 2 }
  const executeTransactions = createExecutor(execOptions)

  const findReturnValue = (receipt, eventName, prop, address) =>
    []
      .concat(receipt.events[eventName])
      .filter((event) => event.address.toLowerCase() === address.toLowerCase())
      .map((event) => event.returnValues[prop])[0]

  const getTokens = function () {
    debug('Getting tokens information')
    return Promise.all([
      getRedeemableBalances(),
      getMintingFee(),
      getRedeemFee()
    ]).then(([redeemable, mintingFee, redeemFee]) =>
      redeemable.map((r) => ({ ...r, mintingFee, redeemFee }))
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

  const getCurveBalance = function (owner = from) {
    debug('Getting VUSD3CRV-f balance of %s', owner)
    return curveMetapool.methods
      .balanceOf(owner)
      .call()
      .then(function (balance) {
        debug('Balance of %s is %s VUSD3CRV-f', owner, fromUnit(balance))
        return balance
      })
  }

  const calcLpWithdraw = function (vusdAmount) {
    if (!vusdAmount) return
    debug(
      'Calculating amount of LP to burn when exepecting to withdraw %s VUSD',
      vusdAmount
    )
    return curveMetapool.methods
      .calc_token_amount([toUnit(vusdAmount), 0], false)
      .call()
      .then(function (amount) {
        return amount
      })
  }

  const sweepDust = (tokenAmount, balance, limit = 0.999) =>
    Big(tokenAmount).div(balance).toNumber() > limit ? balance : tokenAmount

  const calcWithdraw = function (lpAmount) {
    if (!lpAmount) return
    return curveMetapool.methods
      .calc_withdraw_one_coin(lpAmount, 0)
      .call()
      .then((result) => result)
  }

  const addCurveLiquidity = function (
    vusdToken,
    vusdAmount,
    transactionOptions = {}
  ) {
    const { decimals, symbol } = vusdToken
    debug('Adding liquidity: ', fromUnit(vusdAmount, decimals), symbol)
    const owner = transactionOptions.from || from
    const transactionsPromise = isApprovalNeeded(
      vusdToken.address,
      owner,
      contracts.CurveMetapool,
      vusdAmount
    ).then(function (approvalNeeded) {
      const txs = []
      if (approvalNeeded) {
        const contract = new web3.eth.Contract(erc20Abi, vusdToken.address)
        txs.push({
          method: contract.methods.approve(contracts.CurveMetapool, vusdAmount),
          suffix: 'approve',
          gas: 66000
        })
      }
      txs.push({
        method: curveMetapool.methods.add_liquidity(
          [vusdAmount, 0],
          min_mint_amount
        ),
        suffix: 'add_liquidity',
        gas: 6385876
      })
      return txs
    })

    const parseResultsVusd = function (transactionsData) {
      const { receipt } = transactionsData[transactionsData.length - 1]
      // @ts-ignore ts(2345)
      parseReceiptEvents(erc20Abi, contracts.VUSD, receipt)
      const sent = vusdAmount
      const received = findReturnValue(
        receipt,
        'Transfer',
        'value',
        contracts.VUSD
      )

      debug(
        'Deposit of VUSD from %s %s completed',
        fromUnit(vusdAmount, decimals),
        symbol
      )

      debug('Received %s LP', fromUnit(received))
      return { sent, received }
    }

    return executeTransactions(
      transactionsPromise,
      parseResultsVusd,
      transactionOptions
    )
  }

  const removeCurveLiquidity = function (
    token,
    amount,
    transactionOptions = {}
  ) {
    const { decimals, symbol } = findByAddress(token)
    const owner = transactionOptions.from || from
    debug('Removing liquidity: ', fromUnit(amount, decimals), symbol)
    const transactionsPromise = getCurveBalance().then(function (bal) {
      const sweptAmount = sweepDust(amount, bal)
      return isApprovalNeeded(
        token,
        owner,
        contracts.CurveMetapool,
        sweptAmount
      ).then(function (approvalNeeded) {
        const txs = []
        if (approvalNeeded) {
          const contract = new web3.eth.Contract(erc20Abi, token)
          txs.push({
            method: contract.methods.approve(owner, sweptAmount),
            suffix: 'approve',
            gas: 66000
          })
        }
        txs.push({
          method: curveMetapool.methods.remove_liquidity_one_coin(
            sweptAmount,
            0,
            1
          ),
          suffix: 'remove_liquidity',
          gas: 6385876
        })
        return txs
      })
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
        'Withdraw of VUSD from %s %s completed',
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

  const getUserBalances = function (owner = from) {
    debug('Getting token balances of %s', owner)
    return getWhitelistedTokens().then(function (whitelistedTokens) {
      return Promise.all(
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
    })
  }

  // Mints VUSD. The amount is token.
  const mint = function (token, amount, transactionOptions = {}) {
    const { decimals, symbol } = findByAddress(token)
    debug('Minting %s VUSD from %s', fromUnit(amount, decimals), symbol)
    const owner = transactionOptions.from || from
    const transactionsPromise = isApprovalNeeded(
      token,
      owner,
      contracts.Minter,
      amount
    ).then(function (approvalNeeded) {
      const txs = []
      if (approvalNeeded) {
        const contract = new web3.eth.Contract(erc20Abi, token)
        txs.push({
          method: contract.methods.approve(contracts.Minter, amount),
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
    const transactionsPromise = isApprovalNeeded(
      contracts.VUSD,
      owner,
      contracts.Redeemer,
      amount
    ).then(function (approvalNeeded) {
      const txs = []
      if (approvalNeeded) {
        txs.push({
          method: vusd.methods.approve(contracts.Redeemer, amount),
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
    getUserBalances,
    getTokens,
    getRedeemFee,
    getVusdBalance,
    getCurveBalance,
    calcLpWithdraw,
    calcWithdraw,
    mint,
    redeem,
    addCurveLiquidity,
    removeCurveLiquidity
  }
}

module.exports = createVusdLib

'use strict'

require('dotenv').config()

const chai = require('chai')
const chaiSubset = require('chai-subset')
const HDWalletProvider = require('@truffle/hdwallet-provider')

chai.use(chaiSubset).should()

const testWeb3Provider = function (calls, recordCalls, provider) {
  let index = 0

  const recordedCalls = []

  const _provider =
    provider ||
    new HDWalletProvider({
      addressIndex: Number.parseInt(process.env.ACCOUNT || '0'),
      mnemonic: process.env.MNEMONIC,
      numberOfAddresses: 1,
      providerOrUrl: process.env.NODE_URL
    })

  const request = function ({ method, params }) {
    const call = calls[index++]

    if (!call || method !== call.method) {
      if (!recordCalls) {
        throw new Error(`Unexpected call to ${method}`)
      }

      return new Promise(function (resolve, reject) {
        _provider.sendAsync(
          { id: index, method, params, jsonrpc: '2.0' },
          function (err, { error, result }) {
            if (err || error) {
              reject(err || new Error(error.message))
              return
            }
            recordedCalls.push({ method, params, result })
            resolve(result)
          }
        )
      })
    }

    params.forEach(function (param, i) {
      try {
        param.should.containSubset(call.params[i])
      } catch (err) {
        throw new Error(`Call ${method} params mismatch: ${err.message}`)
      }
    })

    return Promise.resolve(
      method === 'eth_getTransactionReceipt'
        ? { ...call.result, status: call.result ? '0x1' : '0x0' }
        : call.result
    )
  }

  return {
    request,
    getCalls: () => recordedCalls
  }
}

module.exports = testWeb3Provider

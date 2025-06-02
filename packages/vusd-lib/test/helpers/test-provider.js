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
      mnemonic: process.env.MNEMONIC || '',
      numberOfAddresses: 1,
      providerOrUrl: process.env.NODE_URL
    })

  const request = function ({ method, params }) {
    const call = calls[index++]

    if (recordCalls) {
      return new Promise(function (resolve, reject) {
        _provider.sendAsync(
          { id: index, jsonrpc: '2.0', method, params },
          function (err, res) {
            const { error, id, result } = res
            if (err || error) {
              reject(err || new Error(error.message))
              return
            }
            recordedCalls.push({ id, method, params, result })
            resolve(result)
          }
        )
      })
    }

    if (!call || method !== call.method) {
      throw new Error(
        `Unexpected call #${index} to ${method} ` +
          `with params ${JSON.stringify(params)} `
      )
    }

    params.forEach(function (param, i) {
      try {
        param.should.containSubset(call.params[i])
      } catch (err) {
        throw new Error(
          `Call #${index} to ${method} mismatch: ` +
            `expected ${JSON.stringify(params)} ` +
            `to match ${JSON.stringify(call.params)}`
        )
      }
    })

    if (!call.result) {
      return new Promise(function (resolve, reject) {
        _provider.sendAsync(
          { id: index, jsonrpc: '2.0', method, params },
          function (err, res) {
            const { error, result } = res
            if (err || error) {
              reject(err || new Error(error.message))
              return
            }
            resolve(result)
          }
        )
      })
    }

    return Promise.resolve(
      method === 'eth_getTransactionReceipt'
        ? { ...call.result, status: call.result ? '0x1' : '0x0' }
        : call.result
    )
  }

  return {
    getCalls: () =>
      recordedCalls.sort((a, b) => a.id - b.id).map(({ id, ...call }) => call),
    request
  }
}

module.exports = testWeb3Provider

const fetch = require('node-fetch')
const debug = require('debug')('ethplorer')
const pLimit = require('p-limit')
const pTap = require('p-tap')
const config = require('config')
const pRetry = require('p-retry')

const apiKey = config.get('ethplorer.apiKey')
const rateLimit = config.get('ethplorer.rateLimit')
const BASE_URL = 'https://api.ethplorer.io'
const RETRIES = 5

const limited = pLimit(rateLimit)

const apiFetch = (path, params = {}) =>
  limited(() =>
    fetch(
      `${BASE_URL}${path}?${new URLSearchParams({
        ...params,
        apiKey
      }).toString()}`
    ).then((response) => response.json())
  )

const getAddressInfo = function (address) {
  debug('Getting data from Ethplorer API for %s', address)
  return pRetry(
    () =>
      apiFetch(`/getAddressInfo/${address}`).then(
        pTap(function () {
          debug('Got data for %s', address)
        })
      ),
    { retries: RETRIES }
  )
}

module.exports = {
  getAddressInfo
}

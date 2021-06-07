import { useWeb3React } from '@web3-react/core'
import { injected } from '../utils/connectors'

export const useRegisterToken = function ({
  address,
  symbol,
  decimals,
  image
}) {
  const { account, chainId, connector } = useWeb3React()
  const registerToken = function () {
    const getStorageKey = () =>
      `isTokenRegistered-${symbol}-${account}-${chainId}`
    const { ethereum } = window
    if (
      connector !== injected ||
      !address ||
      window.localStorage.getItem(getStorageKey()) === 'true'
    ) {
      return
    }
    ethereum
      .request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address, // The address that the token is at.
            symbol, // A ticker symbol or shorthand, up to 5 chars.
            decimals, // The number of decimals in the token
            image // A string url of the token logo
          }
        }
      })
      .then(function () {
        window.localStorage.setItem(getStorageKey(), 'true')
        // eslint-disable-next-line no-console
        console.log('Token successfully registered on MetaMask.')
      })
      .catch((err) =>
        // eslint-disable-next-line no-console
        console.warn(err)
      )
  }
  return registerToken
}

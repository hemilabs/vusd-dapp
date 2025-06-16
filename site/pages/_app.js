import '../styles/index.css'

import { Web3ReactProvider } from '@web3-react/core'
import Big from 'big.js'
import Web3 from 'web3'

function getLibrary(provider) {
  if (provider.isMetaMask) {
    // To force MetaMask to use market suggested fees, we must intercept the
    // calls to request() with method eth_sendTransaction and clear out the gas
    // price property. ¯\_(ツ)_/¯
    // Note; This may not work with newer versions of Web3. Tested with v1.3.0.
    const request = provider.request.bind(provider)
    const wrappedRequest = function ({ method, params }) {
      if (method === 'eth_sendTransaction' && params[0]?.gasPrice) {
        params[0].gasPrice = undefined
      }
      return request({ method, params })
    }
    provider.request = wrappedRequest
  }
  return new Web3(provider)
}

Big.RM = 0

const App = ({ Component, pageProps }) => (
  <Web3ReactProvider getLibrary={getLibrary}>
    <Component {...pageProps} />
  </Web3ReactProvider>
)

export default App

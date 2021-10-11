import '../styles/index.css'
import { Web3ReactProvider } from '@web3-react/core'
import Web3 from 'web3'
import Big from 'big.js'

const getLibrary = provider => new Web3(provider)

Big.RM = 0

const App = ({ Component, pageProps }) => (
  <Web3ReactProvider getLibrary={getLibrary}>
    <Component {...pageProps} />
  </Web3ReactProvider>
)

export default App

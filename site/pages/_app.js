import '../styles/index.css'
import { Web3ReactProvider } from '@web3-react/core'
import Web3 from 'web3'
import { VusdContextProvider } from '../components/context/Vusd'
import Big from 'big.js'

const getLibrary = (provider) => new Web3(provider)

Big.RM = 0

function App({ Component, pageProps }) {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <VusdContextProvider>
        <Component {...pageProps} />
      </VusdContextProvider>
    </Web3ReactProvider>
  )
}

export default App

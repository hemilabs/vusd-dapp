import Web3 from 'web3'
import createVusdLib from 'vusd-lib'

const web3 = new Web3(process.env.NODE_URL)
const vusdLib = createVusdLib(web3)

export const getTokens = async () => vusdLib.getTokens().catch(() => [])

export const getVusd = async () =>
  vusdLib
    .getVusdSupply()
    .then(totalSupply => ({ totalSupply }))
    .catch(() => ({ totalSupply: 0 }))

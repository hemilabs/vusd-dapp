import Web3 from 'web3'
import createVusdLib from 'vusd-lib'

const web3 = new Web3(process.env.NEXT_PUBLIC_NODE_URL)
const vusdLib = createVusdLib(web3)

export async function getTokens() {
  return vusdLib.getTokens().catch(() => [])
}

export async function getVusd() {
  return vusdLib
    .getVusdSupply()
    .then((totalSupply) => ({ totalSupply }))
    .catch(() => ({ totalSupply: 0 }))
}

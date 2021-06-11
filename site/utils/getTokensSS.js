import Web3 from 'web3'
import createVusdLib from 'vusd-lib'

const web3 = new Web3(process.env.NEXT_PUBLIC_NODE_URL)
const vusdLib = createVusdLib(web3)

export default async function getTokensSS() {
  return vusdLib.getTokens().catch(() => [])
}

import Head from 'next/head'
import useSWR from 'swr'
import Big from 'big.js'
import { TokenBalances } from '../components/TokenBalances'
import { EtherscanLink } from '../components/EtherscanLink'
import { getAddressInfo } from '../services/info'
import contracts from 'vusd-lib/src/contracts.json'
import styles from '../styles/Home.module.css'

const useBalance = function (address) {
  return useSWR([`tokenBalances-${address}`], () =>
    getAddressInfo(address).then(function (info) {
      const { ETH, tokens = [] } = info
      const { price, ...restEth } = ETH
      const etherInfo = Big(ETH.rawBalance).gt(0)
        ? [
            {
              tokenInfo: { price: { ...price }, symbol: 'ETH', address },
              ...restEth
            }
          ]
        : []
      return {
        ...info,
        tokens: etherInfo.concat(tokens)
      }
    })
  )
}

const TREASURY = contracts.Treasury
const GOVERNOR = contracts.Governor

const Home = function () {
  const { data: treasuryData } = useBalance(TREASURY)
  const { data: multiSigGovernorData } = useBalance(GOVERNOR)
  if (!treasuryData || !multiSigGovernorData) {
    return <p>Loading...</p>
  }

  return (
    <div>
      <Head>
        <title>VUSD Internal Dashboard</title>
        <link href="/favicon.ico" rel="icon" />
      </Head>
      <main className={styles.main}>
        <h1>VUSD Internal Dashboard</h1>
        <section className={`${styles.main} ${styles.maxWidthFull}`}>
          <h2>Operational Addresses</h2>
          <div className={styles.operationalAddress}>
            <h4>Treasury</h4>
            <EtherscanLink address={TREASURY} long />
            <TokenBalances tokens={treasuryData.tokens} />
          </div>
          <div className={styles.operationalAddress}>
            <h4>Governor</h4>
            <EtherscanLink address={GOVERNOR} long />
            <TokenBalances tokens={multiSigGovernorData.tokens} />
          </div>
        </section>
      </main>
    </div>
  )
}

export default Home

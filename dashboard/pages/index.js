import Head from 'next/head'
import useSWR from 'swr'
import Big from 'big.js'
import { TokenBalances } from '../components/TokenBalances'
import { EtherscanLink } from '../components/EtherscanLink'
import { getAddressInfo } from '../services/info'
import styles from '../styles/Home.module.css'

const useBalance = function (address, initialData) {
  return useSWR(
    [`tokenBalances-${address}`],
    () =>
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
      }),
    { initialData }
  )
}

const TREASURY = '0x813E891e2Bb6729beF4185663624bd09F4902bD8'
const MULTI_SIG_GOVERNOR = '0x6c2e3f1a88C19Bf4cf14fa38B8f745330573Da37'

const Home = function ({ treasuryInitialData, multiSigGovernorInitialData }) {
  const { data: treasuryData } = useBalance(TREASURY, treasuryInitialData)
  const { data: multiSigGovernorData } = useBalance(
    MULTI_SIG_GOVERNOR,
    multiSigGovernorInitialData
  )
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
            <h4>MultiSig</h4>
            <EtherscanLink address={MULTI_SIG_GOVERNOR} long />
            <TokenBalances tokens={multiSigGovernorData.tokens} />
          </div>
        </section>
      </main>
    </div>
  )
}

export async function getStaticProps() {
  return Promise.all([
    getAddressInfo(TREASURY),
    getAddressInfo(MULTI_SIG_GOVERNOR)
  ]).then(([treasuryInitialData, multiSigGovernorInitialData]) => ({
    props: { treasuryInitialData, multiSigGovernorInitialData },
    revalidate: 15 // seconds
  }))
}

export default Home

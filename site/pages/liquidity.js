import useSWR from 'swr'
import { useWeb3React } from '@web3-react/core'
import getTokensSS from '../utils/getTokensSS'
import Layout from '../components/Layout'
import Transactions from '../components/Transactions'
import Liquidity from '../components/Liquidity'
import Treasury from '../components/Treasury'
import { TransactionContextProvider } from '../components/TransactionContext'
import { VusdContextProvider } from '../components/context/Vusd'
import BetaModal from '../components/BetaModal'

const HomePage = function ({ tokensInitialData }) {
  const fetcher = (...args) => fetch(...args).then((res) => res.json())
  const { active } = useWeb3React()
  const { data } = useSWR('/api/tokens', fetcher, {
    initialData: tokensInitialData,
    refreshInterval: !active ? 15000 : false,
    revalidateOnFocus: !active
  })
  return (
    <VusdContextProvider tokensInitialData={data}>
      <TransactionContextProvider>
        <Layout walletConnection>
          <div className="flex flex-wrap justify-between w-full ">
            <Treasury />
          </div>
          <div className="flex flex-wrap justify-between w-full ">
            <Liquidity />
          </div>
          <BetaModal />
          <Transactions />
        </Layout>
      </TransactionContextProvider>
    </VusdContextProvider>
  )
}

export async function getStaticProps() {
  return getTokensSS().then((tokensInitialData) => ({
    props: { tokensInitialData },
    revalidate: 15 // seconds
  }))
}

export default HomePage

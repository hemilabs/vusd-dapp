import useSWR from 'swr'
import { useWeb3React } from '@web3-react/core'
import { getTokens, getVusd } from '../utils/getDataSS'
import Layout from '../components/Layout'
import Transactions from '../components/Transactions'
import Liquidity from '../components/Liquidity'
import Treasury from '../components/Treasury'
import { TransactionContextProvider } from '../components/TransactionContext'
import { VusdContextProvider } from '../components/context/Vusd'
import BetaModal from '../components/BetaModal'

const HomePage = function ({ tokensInitialData, vusdInitialData }) {
  const fetcher = (...args) => fetch(...args).then((res) => res.json())
  const { active } = useWeb3React()
  const { data: tokensData } = useSWR('/api/tokens', fetcher, {
    initialData: tokensInitialData,
    refreshInterval: !active ? 15000 : false,
    revalidateOnFocus: !active
  })
  const { data: vusdData } = useSWR('/api/vusd', fetcher, {
    initialData: vusdInitialData,
    refreshInterval: !active ? 15000 : false,
    revalidateOnFocus: !active
  })
  return (
    <VusdContextProvider
      tokensInitialData={tokensData}
      vusdInitialData={vusdData}
    >
      <TransactionContextProvider>
        <Layout walletConnection>
          <div className="flex flex-wrap justify-between w-full mb-14">
            <Treasury />
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
  return Promise.all([getTokens(), getVusd()]).then(
    ([tokensInitialData, vusdInitialData]) => ({
      props: { tokensInitialData, vusdInitialData },
      revalidate: 15 // seconds
    })
  )
}

export default HomePage

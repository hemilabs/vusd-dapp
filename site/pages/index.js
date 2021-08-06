import useSWR from 'swr'
import { useWeb3React } from '@web3-react/core'
import { getTokens, getVusd } from '../utils/getDataSS'
import Layout from '../components/Layout'
import Transactions from '../components/Transactions'
import Treasury from '../components/Treasury'
import { TransactionContextProvider } from '../components/TransactionContext'
import { VusdContextProvider } from '../components/context/Vusd'
import BetaModal from '../components/BetaModal'
import AppSelector from '../components/AppSelector'
import Mint from '../components/Mint'
import Redeem from '../components/Redeem'
import TabSelector from '../components/TabSelector'

const tabs = [
  {
    name: 'mint',
    component: Mint
  },
  {
    name: 'redeem',
    component: Redeem
  }
]

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
          <div className="flex flex-wrap justify-between mb-14 w-full">
            <Treasury />
            <div>
              <AppSelector />
              <TabSelector tabs={tabs} />
            </div>
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

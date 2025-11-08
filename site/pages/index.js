import { useWeb3React } from '@web3-react/core'
import useSWR from 'swr'

import AppSelector from '../components/AppSelector'
import { VusdContextProvider } from '../components/context/Vusd'
import Layout from '../components/Layout'
import Mint from '../components/Mint'
import Redeem from '../components/Redeem'
import TabSelector from '../components/TabSelector'
import { TransactionContextProvider } from '../components/TransactionContext'
import Transactions from '../components/Transactions'
import Treasury from '../components/Treasury'
import { getTokens, getVusd } from '../utils/getDataSS'

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
  const fetcher = (...args) => fetch(...args).then(res => res.json())
  const { active } = useWeb3React()
  const { data: tokensData } = useSWR('/api/tokens', fetcher, {
    initialData: tokensInitialData,
    refreshInterval: !active ? 15000 : undefined,
    revalidateOnFocus: !active
  })
  const { data: vusdData } = useSWR('/api/vusd', fetcher, {
    initialData: vusdInitialData,
    refreshInterval: !active ? 15000 : undefined,
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
          <Transactions />
        </Layout>
      </TransactionContextProvider>
    </VusdContextProvider>
  )
}

export const getStaticProps = async () =>
  Promise.all([getTokens(), getVusd()]).then(
    ([tokensInitialData, vusdInitialData]) => ({
      props: { tokensInitialData, vusdInitialData },
      revalidate: 15 // seconds
    })
  )

export default HomePage

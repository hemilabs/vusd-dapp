import Layout from '../components/Layout'
import Transactions from '../components/Transactions'
import SwapBox from '../components/SwapBox'
import Treasury from '../components/Treasury'
import { TransactionContextProvider } from '../components/TransactionContext'

const HomePage = () => (
  <TransactionContextProvider>
    <Layout walletConnection>
      <div className="flex flex-wrap justify-center w-full mb-14">
        <Treasury />
        <SwapBox />
      </div>
      <Transactions />
    </Layout>
  </TransactionContextProvider>
)

export default HomePage

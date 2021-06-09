import Layout from '../components/Layout'
import SwapBox from '../components/SwapBox'
import Treasury from '../components/Treasury'

const HomePage = () => (
  <Layout walletConnection>
    <div className="flex flex-wrap justify-center w-full mb-14">
      <Treasury />
      <SwapBox />
    </div>
  </Layout>
)

export default HomePage

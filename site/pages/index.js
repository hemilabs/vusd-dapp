import Layout from '../components/Layout'
import SwapBox from '../components/SwapBox'

const HomePage = () => (
  <Layout walletConnection>
    <div className="flex justify-center w-full mb-14">
      <SwapBox />
    </div>
  </Layout>
)

export default HomePage

import Mint from './Mint'
import Redeem from './Redeem'
import TabSelector from './TabSelector'

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

const SwapBox = function () {
  return (
    <TabSelector
      className="w-full px-8 py-8 bg-white shadow-md xl:px-40 xl:w-160 rounded-md"
      tabs={tabs}
    />
  )
}

export default SwapBox

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
    <TabSelector className="w-full px-40 py-8 bg-white xl:w-160" tabs={tabs} />
  )
}

export default SwapBox

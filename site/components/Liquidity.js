import TabSelector from './TabSelector'
import AddLiquidity from './AddLiquidity'
import RemoveLiquidity from './RemoveLiquidity'

const tabs = [
  {
    name: 'addliquidity',
    component: AddLiquidity
  },
  {
    name: 'removeliquidity',
    component: RemoveLiquidity
  }
]

const Liquidity = function () {
  return (
    <TabSelector
      className="w-full px-2 py-8 bg-white shadow-md md:px-8 xl:px-40 xl:w-160 rounded-md"
      tabs={tabs}
    />
  )
}

export default Liquidity

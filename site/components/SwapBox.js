import Mint from './Mint'
import Redeem from './Redeem'
import TabSelector from './TabSelector'
import CurveDeposit from './CurveDeposit'
import CurveWithdraw from './CurveWithdraw'
import useTranslation from 'next-translate/useTranslation'

const tabs = [
  {
    name: 'mint',
    component: Mint
  },
  {
    name: 'redeem',
    component: Redeem
  },
  {
    name: 'curvedeposit',
    component: CurveDeposit
  },
  {
    name: 'curvewithdraw',
    component: CurveWithdraw
  }
]

const SwapBox = function () {
  const { t } = useTranslation('common')

  return (
    <div className="w-full pt-4 pb-8 pl-8 pr-8 bg-indigo-50 rounded-md">
      <p className="mb-2 text-lg font-bold">{t('liquidity')}</p>
      <TabSelector
        className="w-full px-8 py-8 bg-white  rounded-md"
        tabs={tabs}
      />
    </div>
  )
}

export default SwapBox

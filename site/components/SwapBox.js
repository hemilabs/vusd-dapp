import Mint from './Mint'
import Redeem from './Redeem'
import TabSelector from './TabSelector'
import useTranslation from 'next-translate/useTranslation'

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
  const { t } = useTranslation('common')
  return (
    <div className="h-full">
      <p className="mb-2 text-sm font-bold text-vesper uppercase">
        {t('mint')} / {t('redeem')}
      </p>
      <TabSelector tabs={tabs} />
    </div>
  )
}

export default SwapBox

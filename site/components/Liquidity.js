import TabSelector from './TabSelector'
import AddLiquidity from './AddLiquidity'
import RemoveLiquidity from './RemoveLiquidity'
import useTranslation from 'next-translate/useTranslation'

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
  const { t } = useTranslation('common')
  return (
    <div className="h-full">
      <p className="mb-2 text-sm font-bold uppercase text-vesper">
        {t('curve-title')}
      </p>
      <TabSelector tabs={tabs} />
    </div>
  )
}

export default Liquidity

import Big from 'big.js'
import { useContext } from 'react'
import { fromUnit, toFixed } from '../utils'
import VusdContext from './context/Vusd'
import useTranslation from 'next-translate/useTranslation'
import SvgContainer from './svg/SvgContainer'
import { useNumberFormat } from '../hooks/useNumberFormat'

const TreasuryAssetBox = function ({ title, symbol, valueInUnit }) {
  const formatNumber = useNumberFormat()
  return (
    <div className="flex items-center justify-between mb-4 px-5 w-full h-20 bg-white rounded-md shadow-md">
      <div className="flex items-center">
        <SvgContainer height="45" name={symbol} width="45" />
        <span className="text-vesper ml-2 font-semibold">
          {title || symbol}
        </span>
      </div>
      <div className="font-bold">
        {formatNumber(toFixed(fromUnit(valueInUnit), 2))}
      </div>
    </div>
  )
}

const Treasury = function () {
  const formatNumber = useNumberFormat()
  const { t } = useTranslation('common')
  const { vusd } = useContext(VusdContext)
  const { tokensData, totalSupply } = vusd
  const treasuryValue = tokensData.reduce(
    (accumulator, token) => accumulator.plus(Big(token.redeemableVusd)),
    Big(0)
  )
  const treasuryExcess = Big(treasuryValue).minus(totalSupply)

  return (
    <div className="xl:w-88 mb-12 w-full">
      <p className="text-vesper mb-2 text-sm font-bold">
        {t('treasury').toUpperCase()}
      </p>
      <div className="w-full">
        {tokensData &&
          tokensData.map(({ symbol, redeemableVusd }) => (
            <TreasuryAssetBox
              key={symbol}
              symbol={symbol}
              valueInUnit={redeemableVusd}
            />
          ))}
        <div className="mt-4 pt-4 w-full border-t-2">
          <TreasuryAssetBox
            symbol="vusd"
            title={t('vusd-minted')}
            valueInUnit={totalSupply}
          />
        </div>
        <div className="flex mt-4 pt-4 w-full border-t-2 space-x-4">
          <div className="py-8 w-full text-center font-semibold bg-white rounded-md">
            <p className="text-vesper pb-1">{t('treasury-total')}</p>
            <p>{formatNumber(toFixed(fromUnit(treasuryValue), 2))}</p>
          </div>

          <div className="py-8 w-full text-center font-semibold bg-white rounded-md">
            <p className="text-vesper pb-1">{t('treasury-excess')}</p>
            <p>{formatNumber(toFixed(fromUnit(treasuryExcess), 2))}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Treasury

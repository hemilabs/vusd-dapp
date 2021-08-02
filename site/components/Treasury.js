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
    <div className="flex items-center justify-between w-full h-20 px-5 mb-4 bg-white shadow-md rounded-md">
      <div className="flex items-center">
        <SvgContainer height="45" name={symbol} width="45" />
        <span className="ml-2 font-semibold text-vesper">
          {title || symbol}
        </span>
      </div>
      <div className="font-bold">
        {formatNumber(toFixed(fromUnit(valueInUnit), 4))}
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
    (accumulator, token) => accumulator.plus(Big(token.redeemable)),
    Big(0)
  )
  const treasuryExcess = Big(treasuryValue).minus(totalSupply)

  return (
    <div className="w-full mb-12 xl:w-88">
      <p className="mb-2 text-sm font-bold text-vesper">
        {t('treasury').toUpperCase()}
      </p>
      <div className="w-full">
        {tokensData &&
          tokensData.map(({ symbol, redeemable }) => (
            <TreasuryAssetBox
              key={symbol}
              symbol={symbol}
              valueInUnit={redeemable}
            />
          ))}
        <div className="w-full pt-4 mt-4 border-t-2">
          <TreasuryAssetBox
            symbol="vusd"
            title={t('vusd-minted')}
            valueInUnit={totalSupply}
          />
        </div>
        <div className="flex w-full pt-4 mt-4 border-t-2 space-x-4">
          <div className="w-full py-8 font-semibold text-center bg-white rounded-md">
            <p className="pb-1 text-vesper">{t('treasury-total')}</p>
            <p>{formatNumber(toFixed(fromUnit(treasuryValue), 4))}</p>
          </div>

          <div className="w-full py-8 font-semibold text-center bg-white rounded-md">
            <p className="pb-1 text-vesper">{t('treasury-excess')}</p>
            <p>{formatNumber(toFixed(fromUnit(treasuryExcess), 4))}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Treasury

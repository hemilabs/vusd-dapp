import { useContext } from 'react'
import { fromUnit, toFixed } from '../utils'
import VusdContext from './context/Vusd'
import useTranslation from 'next-translate/useTranslation'
import SvgContainer from './svg/SvgContainer'

const Treasury = function () {
  const { t } = useTranslation('common')
  const { vusd } = useContext(VusdContext)
  const { tokensData } = vusd

  return (
    <div className="w-full mb-12 xl:w-88">
      <div className="">
        <p className="mb-2 text-sm font-bold text-left text-vesper">
          {t('treasury').toUpperCase()}
        </p>
        <div className="w-full">
          {tokensData &&
            tokensData.map((token) => (
              <div
                className="flex items-center justify-between w-full h-20 px-5 mb-4 bg-white"
                key={token.symbol}
              >
                <div className="flex items-center">
                  <SvgContainer height="45" name={token.symbol} width="45" />
                  <span className="ml-2 font-semibold text-vesper">
                    {token.symbol}
                  </span>
                </div>
                <div className="font-bold">
                  {toFixed(fromUnit(token.redeemable), 4)}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}

export default Treasury

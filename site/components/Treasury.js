import { useContext } from 'react'
import { fromUnit, toFixed } from '../utils'
import VusdContext from './context/Vusd'

const Treasury = function () {
  const { vusd } = useContext(VusdContext)
  const { tokensData } = vusd

  return (
    <div className="w-full mb-12">
      <div className="border-2 rounded-xl">
        <p className="mb-2 text-lg font-bold text-center">Treasury</p>
        <div className="flex justify-around w-full">
          {tokensData &&
            tokensData.map((t) => (
              <div className="flex space-x-1" key={t.symbol}>
                <div>{t.symbol}:</div>
                <div>{toFixed(fromUnit(t.redeemable), 4)}</div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}

export default Treasury

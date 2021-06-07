import Big from 'big.js'
import { useContext, useEffect, useState } from 'react'
import { fromUnit, toFixed, toUnit } from '../utils'
import Button from './Button'
import Input from './Input'
import { useRegisterToken } from '../hooks/useRegisterToken'
import TokenSelector from './TokenSelector'
import VusdContext from './context/Vusd'

const Redeem = function () {
  const { vusd } = useContext(VusdContext)
  const { redeem, tokensData, vusdBalance } = vusd
  const [selectedToken, setSelectedToken] = useState({})
  const [amount, setAmount] = useState('')

  const fixedVUSBalance = toFixed(fromUnit(vusdBalance || 0), 4)
  const vusdAvailable = Big(vusdBalance || 0).gt(0)
  const redeemDisabled =
    Big(0).gte(Big(amount || 0)) ||
    Big(toUnit(amount || 0)).gt(Big(selectedToken.redeemable || 0))

  const registerToken = useRegisterToken(selectedToken)

  useEffect(
    function () {
      setAmount('')
    },
    [selectedToken.symbol]
  )

  const handleRedeem = function (token, mintAmount) {
    const { promise } = redeem(token.address, toUnit(mintAmount))
    return promise.then(function (res) {
      console.log(res)
      setAmount('')
      registerToken()
      setSelectedToken(
        tokensData.find((t) => t.address === selectedToken.address)
      )
    })
  }

  const handleChange = (e) => setAmount(e.target.value)

  return (
    <div className="flex flex-wrap w-full py-4 space-y-6">
      <div className="w-full">
        <Input
          caption={`VUSD balance: ${fixedVUSBalance}`}
          disabled={!vusdAvailable}
          onChange={handleChange}
          suffix="VUSD"
          title="Amount"
          value={amount}
        />
      </div>
      <div className="w-full">
        <TokenSelector
          balanceKey="redeemable"
          balancePrefix=" MAX "
          balanceSuffix=" VUSD"
          decimals="18"
          selectedToken={selectedToken}
          setSelectedToken={setSelectedToken}
          tokensList={tokensData}
        />
      </div>
      <div className="w-full">
        <Button
          disabled={redeemDisabled}
          onClick={() => handleRedeem(selectedToken, amount)}
        >
          Redeem
        </Button>
      </div>
    </div>
  )
}

export default Redeem

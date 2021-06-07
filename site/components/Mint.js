import Big from 'big.js'
import { useContext, useEffect, useState } from 'react'
import { fromUnit, toUnit, toFixed } from '../utils'
import Button from './Button'
import Input from './Input'
import TokenSelector from './TokenSelector'
import VusdContext from './context/Vusd'
import { useRegisterToken } from '../hooks/useRegisterToken'

const Mint = function () {
  const { vusd } = useContext(VusdContext)
  const { mint, tokensData, vusdBalance } = vusd
  const [selectedToken, setSelectedToken] = useState({})
  const [amount, setAmount] = useState('')
  const registerVUSD = useRegisterToken({
    symbol: 'VUSD',
    address: '0x677ddbd918637E5F2c79e164D402454dE7dA8619',
    decimals: 18
  })

  const fixedVUSBalance = toFixed(fromUnit(vusdBalance || 0), 4)
  const tokenAvailable = Big(selectedToken.balance || 0).gt(0)
  const mintDisabled =
    Big(0).gte(Big(amount || 0)) ||
    Big(toUnit(amount || 0, selectedToken.decimals)).gt(
      Big(selectedToken.balance || 0)
    )

  const handleMint = function (token, mintAmount) {
    const { promise } = mint(token.address, toUnit(mintAmount, token.decimals))
    return promise.then(function (res) {
      console.log(res)
      setAmount('')
      registerVUSD()
    })
  }

  const handleChange = (e) => setAmount(e.target.value)

  useEffect(
    function () {
      setAmount('')
    },
    [selectedToken.symbol]
  )

  return (
    <div className="flex flex-wrap w-full py-4 space-y-6">
      <div className="w-full">
        <TokenSelector
          balanceKey="balance"
          selectedToken={selectedToken}
          setSelectedToken={setSelectedToken}
          tokensList={tokensData}
        />
      </div>
      <div className="w-full">
        <Input
          caption={`VUSD balance: ${fixedVUSBalance}`}
          disabled={!tokenAvailable}
          onChange={handleChange}
          title="Amount"
          value={amount}
        />
      </div>
      <div className="w-full">
        <Button
          disabled={mintDisabled}
          onClick={() => handleMint(selectedToken, amount)}
        >
          Mint
        </Button>
      </div>
    </div>
  )
}

export default Mint

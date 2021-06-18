import Big from 'big.js'
import { useContext, useEffect, useState } from 'react'
import useTranslation from 'next-translate/useTranslation'
import { fromUnit, toFixed, toUnit } from '../utils'
import getErrorKey from '../utils/errorKeys'
import Button from './Button'
import Input from './Input'
import { useRegisterToken } from '../hooks/useRegisterToken'
import TokenSelector from './TokenSelector'
import TransactionContext from './TransactionContext'
import VusdContext from './context/Vusd'

const Redeem = function () {
  const { addTransactionStatus } = useContext(TransactionContext)
  const { vusd } = useContext(VusdContext)
  const { redeem, tokensData, vusdBalance } = vusd
  const [selectedToken, setSelectedToken] = useState({})
  const [amount, setAmount] = useState('')
  const { t } = useTranslation('common')

  const fixedVUSBalance = toFixed(fromUnit(vusdBalance || 0), 4)
  const vusdAvailable = Big(vusdBalance || 0).gt(0)
  const redeemDisabled =
    Big(0).gte(Big(amount || 0)) ||
    Big(toUnit(amount || 0)).gt(Big(selectedToken.walletRedeemable || 0))

  const registerToken = useRegisterToken(selectedToken)

  useEffect(
    function () {
      setAmount('')
    },
    [selectedToken.symbol]
  )

  const handleMaxAmountClick = () =>
    vusdAvailable && setAmount(fromUnit(selectedToken.walletRedeemable))

  const handleRedeem = function (token, mintAmount) {
    const fixedAmount = Big(mintAmount).round(4, 0).toFixed(4)
    const internalTransactionId = Date.now()
    const { emitter } = redeem(token.address, toUnit(mintAmount))
    setTimeout(function () {
      setAmount('')
    }, 3000)
    return emitter
      .on('transactions', function (transactions) {
        addTransactionStatus({
          internalTransactionId,
          transactionStatus: 'created',
          sentSymbol: 'VUSD',
          receivedSymbol: token.symbol,
          suffixes: transactions.suffixes,
          expectedFee: Big(fromUnit(transactions.expectedFee)).toFixed(4),
          operation: 'redeem',
          sent: fixedAmount,
          estimatedReceive: Big(mintAmount)
            .times(1 - token.redeemFee)
            .round(4, 0)
            .toFixed(4),
          redeemFee: token.redeemFee
        })
        return transactions.suffixes.forEach(function (suffix, idx) {
          emitter.on(`transactionHash-${suffix}`, (transactionHash) =>
            addTransactionStatus({
              internalTransactionId,
              transactionStatus: 'in-progress',
              [`transactionStatus-${idx}`]: 'waiting-to-be-mined',
              [`transactionHash-${idx}`]: transactionHash
            })
          )
          emitter.on(`receipt-${suffix}`, ({ receipt }) =>
            addTransactionStatus({
              internalTransactionId,
              currentTransaction: idx + 1,
              [`transactionStatus-${idx}`]: receipt.status
                ? 'confirmed'
                : 'canceled',
              [`transactionHash-${idx}`]: receipt.transactionHash
            })
          )
        })
      })
      .on('result', function ({ fees, status, received }) {
        registerToken()
        addTransactionStatus({
          internalTransactionId,
          transactionStatus: status ? 'confirmed' : 'canceled',
          fee: Big(fromUnit(fees)).toFixed(4),
          received:
            status &&
            Big(fromUnit(received, token.decimals)).round(4, 0).toFixed(4)
        })
      })
      .on('error', function (error) {
        addTransactionStatus({
          internalTransactionId,
          transactionStatus: 'error',
          message: t(`${getErrorKey(error)}`)
        })
      })
  }

  const handleChange = function (e) {
    const re = /^([0-9]\d*(\.)\d*|0?(\.)\d*[0-9]\d*|[0-9]\d*)$/
    if (e.target.value === '' || re.test(e.target.value)) {
      setAmount(e.target.value)
    }
  }

  return (
    <div className="flex flex-wrap w-full py-4 space-y-6">
      <div className="w-full">
        <TokenSelector
          balanceKey="walletRedeemable"
          balancePrefix=" MAX "
          balanceSuffix=" VUSD"
          decimals="18"
          selectedToken={selectedToken}
          setSelectedToken={setSelectedToken}
          tokensList={tokensData}
        />
      </div>
      <div className="w-full">
        <Input
          caption={`VUSD balance: ${fixedVUSBalance}`}
          disabled={!vusdAvailable}
          onChange={handleChange}
          onSuffixClick={() => handleMaxAmountClick()}
          suffix="MAX"
          title={t('amount')}
          value={amount}
        />
      </div>
      <div className="w-full">
        <Button
          disabled={redeemDisabled}
          onClick={() => handleRedeem(selectedToken, amount)}
        >
          {t('redeem')}
        </Button>
      </div>
    </div>
  )
}

export default Redeem

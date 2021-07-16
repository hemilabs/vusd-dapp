import Big from 'big.js'
import { useContext, useEffect, useState } from 'react'
import useTranslation from 'next-translate/useTranslation'
import { fromUnit, toFixed, toUnit } from '../utils'
import getErrorKey from '../utils/errorKeys'
import Button from './Button'
import Input from './Input'
import { useRegisterToken } from '../hooks/useRegisterToken'
// import TokenSelector from './TokenSelector'
import TransactionContext from './TransactionContext'
import VusdContext from './context/Vusd'
import { useNumberFormat } from '../hooks/useNumberFormat'

const CurveWithdraw = function () {
  const { addTransactionStatus } = useContext(TransactionContext)
  const { vusd } = useContext(VusdContext)
  const { vusdBalance, curveBalance, removeCurveLiquidity } = vusd
  const [selectedToken, setSelectedToken] = useState({})
  const [amount, setAmount] = useState('')
  const { t } = useTranslation('common')
  const formatNumber = useNumberFormat()

  const fixedVUSBalance = toFixed(fromUnit(vusdBalance || 0), 4)
  const fixedCurveBalance = toFixed(fromUnit(curveBalance || 0), 4)

  const withdrawDisabled =
    Big(0).gte(Big(amount || 0)) ||
    Big(toUnit(amount || 0, 18)).gt(Big(curveBalance || 0))
  const lpAvailable = Big(curveBalance || 0).gt(0)
  const vusdToken = {
    address: '0x677ddbd918637E5F2c79e164D402454dE7dA8619',
    decimals: 18,
    symbol: 'VUSD'
  }

  const registerToken = useRegisterToken(vusdToken)
  const lpToken = {
    address: '0x4dF9E1A764Fb8Df1113EC02fc9dc75963395b508',
    chainId: 1,
    decimals: 18,
    name: 'VUSD3CRV-f',
    symbol: 'VUSD3CRV-f'
  }

  useEffect(
    function () {
      setAmount('')
      setSelectedToken(lpToken)
    },
    [selectedToken.symbol]
  )

  const handleMaxAmountClick = () =>
    lpAvailable && setAmount(fromUnit(curveBalance, 18))

  const handleWithdraw = function (token, withdrawAmount) {
    const fixedAmount = Big(withdrawAmount).round(4, 0).toFixed(4)
    const internalTransactionId = Date.now()
    const { emitter } = removeCurveLiquidity(
      token.address,
      toUnit(withdrawAmount, token.decimals)
    )
    setTimeout(function () {
      setAmount('')
    }, 3000)
    return emitter
      .on('transactions', function (transactions) {
        addTransactionStatus({
          internalTransactionId,
          transactionStatus: 'created',
          sentSymbol: 'VUSD3CRV-f',
          receivedSymbol: token.symbol,
          suffixes: transactions.suffixes,
          expectedFee: Big(fromUnit(transactions.expectedFee)).toFixed(4),
          operation: 'curve-modal-title-withdraw',
          sent: fixedAmount,
          estimatedReceive: Big(withdrawAmount).times(1).round(4, 0).toFixed(4)
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
    <div className="flex flex-wrap py-4 w-80 space-y-6">
      <div className="w-full">
        <Input
          disabled={!lpAvailable}
          onChange={handleChange}
          onSuffixClick={() => handleMaxAmountClick()}
          suffix="MAX"
          title={`${t('curve-input-title-withdraw')} ${selectedToken.symbol}`}
          value={amount}
        />
      </div>

      <div className="flex justify-between w-full text-xs text-gray-400">
        <div className="font-semibold">{t('current-vusd-balance')}:</div>
        <div className="font-sm">{formatNumber(fixedVUSBalance)}</div>
      </div>

      <div className="flex justify-between w-full text-xs text-gray-400">
        <div className="font-semibold">{t('current-curve-balance')}:</div>
        <div className="font-sm">{formatNumber(fixedCurveBalance)}</div>
      </div>

      <div className="w-full">
        <Button
          disabled={withdrawDisabled}
          onClick={() => handleWithdraw(lpToken, amount)}
        >
          {t('curve-button-withdraw')}
        </Button>
      </div>
    </div>
  )
}

export default CurveWithdraw

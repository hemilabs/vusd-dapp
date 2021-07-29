import { useWeb3React } from '@web3-react/core'
import Big from 'big.js'
import { useContext, useEffect, useState } from 'react'
import useTranslation from 'next-translate/useTranslation'
import { fromUnit, toFixed, toUnit, ONLY_NUMBERS_REGEX } from '../utils'
import { findBySymbol } from 'vusd-lib'
import getErrorKey from '../utils/errorKeys'
import Button from './Button'
import Input from './Input'
import TransactionContext from './TransactionContext'
import VusdContext from './context/Vusd'
import { useNumberFormat } from '../hooks/useNumberFormat'

const CurveWithdraw = function () {
  const { active } = useWeb3React()
  const { addTransactionStatus } = useContext(TransactionContext)
  const { vusd } = useContext(VusdContext)

  const vusdToken = findBySymbol('VUSD')
  const lpToken = findBySymbol('VUSD3CRV-f')

  const {
    calcLpWithdraw,
    curveBalance,
    curveBalanceInVusd,
    removeCurveLiquidity,
    vusdBalance
  } = vusd

  const [amount, setAmount] = useState('')
  const [withdrawDisabled, setWithdrawDisabled] = useState(false)
  const { t } = useTranslation('common')
  const formatNumber = useNumberFormat()
  const fixedVusdBalance = toFixed(fromUnit(vusdBalance || 0), 4)
  const fixedCurveBalance = toFixed(fromUnit(curveBalance || 0), 4)

  useEffect(
    function () {
      if (active) {
        setWithdrawDisabled(
          Big(0).gte(Big(amount || 0)) ||
            Big(toUnit(amount || 0, 18)).gt(Big(curveBalanceInVusd || 0))
        )
      }
    },
    [amount]
  )

  const handleMaxAmountClick = () => {
    if (active) return setAmount(fromUnit(curveBalanceInVusd))
  }

  const handleWithdraw = function (token, vusdAmount) {
    calcLpWithdraw(vusdAmount).then(function (withdrawAmount) {
      const internalTransactionId = Date.now()
      const { emitter } = removeCurveLiquidity(token.address, withdrawAmount)

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
            operation: 'liquidity',
            title: 'curve-modal-title-withdraw',
            sent: Big(vusdAmount).round(4, 0).toFixed(4),
            estimatedReceive: Big(withdrawAmount)
              .times(1)
              .round(4, 0)
              .toFixed(4)
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
    })
  }

  const handleChange = function (e) {
    if (e.target.value === '' || ONLY_NUMBERS_REGEX.test(e.target.value)) {
      setAmount(e.target.value)
    }
  }

  return (
    <div className="flex flex-wrap py-4 w-80 space-y-6">
      <div className="w-full">
        <Input
          disabled={!curveBalance || !active}
          onChange={handleChange}
          onSuffixClick={() => handleMaxAmountClick()}
          suffix={t('max')}
          title={t('curve-input-title-withdraw', { symbol: vusdToken.symbol })}
          value={amount}
        />
      </div>

      <div className="flex justify-between w-full text-xs text-gray-400">
        <div className="font-semibold">{t('current-vusd-balance')}:</div>
        <div className="font-sm">{formatNumber(fixedVusdBalance)}</div>
      </div>

      <div className="flex justify-between w-full text-xs text-gray-400">
        <div className="font-semibold">{t('current-curve-balance')}:</div>
        <div className="font-sm">{formatNumber(fixedCurveBalance)}</div>
      </div>

      <div className="w-full">
        <Button
          disabled={!active || withdrawDisabled}
          onClick={() => handleWithdraw(lpToken, amount)}
        >
          {t('curve-button-withdraw')}
        </Button>
      </div>
    </div>
  )
}

export default CurveWithdraw

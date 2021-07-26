import { useWeb3React } from '@web3-react/core'
import Big from 'big.js'
import { useContext, useEffect, useState } from 'react'
import useTranslation from 'next-translate/useTranslation'
import { fromUnit, toUnit, toFixed } from '../utils'
import getErrorKey from '../utils/errorKeys'
import Button from './Button'
import Input from './Input'
import TransactionContext from './TransactionContext'
import VusdContext from './context/Vusd'
import { useRegisterToken } from '../hooks/useRegisterToken'
import { useNumberFormat } from '../hooks/useNumberFormat'

const CurveDeposit = function () {
  const { addTransactionStatus } = useContext(TransactionContext)
  const { vusd } = useContext(VusdContext)
  const { vusdBalance, curveBalance, addCurveLiquidity } = vusd
  const [vusdAmount, setvusdAmount] = useState('')
  const { t } = useTranslation('common')

  const formatNumber = useNumberFormat()

  const registerLPToken = useRegisterToken({
    symbol: 'VUSD3CRV-f',
    address: '0x4dF9E1A764Fb8Df1113EC02fc9dc75963395b508',
    decimals: 18
  })

  const vusdToken = {
    address: '0x677ddbd918637E5F2c79e164D402454dE7dA8619',
    chainId: 1,
    decimals: 18,
    name: 'VUSD',
    symbol: 'VUSD'
  }

  const { active } = useWeb3React()
  const fixedVusdBalance = toFixed(fromUnit(vusdBalance || 0), 4)
  const fixedCurveBalance = toFixed(fromUnit(curveBalance || 0), 4)
  const vusdAvailable = Big(vusdBalance || 0).gt(0)
  const depositDisabled =
    Big(0).gte(Big(vusdAmount || 0)) ||
    Big(toUnit(vusdAmount || 0, 18)).gt(Big(vusdBalance || 0))

  const handleVusdMaxAmountClick = () =>
    vusdAvailable && setvusdAmount(fromUnit(vusdBalance, 18))

  const handleDeposit = function (_vusdToken, _vusdAmount) {
    const fixedAmount = Big(_vusdAmount).round(4, 0).toFixed(4)
    const internalTransactionId = Date.now()
    const { emitter } = addCurveLiquidity(
      _vusdToken,
      toUnit(_vusdAmount, _vusdToken.decimals)
    )

    setTimeout(function () {
      setvusdAmount('')
    }, 3000)

    return emitter
      .on('transactions', function (transactions) {
        addTransactionStatus({
          internalTransactionId,
          transactionStatus: 'created',
          sentSymbol: vusdToken.symbol,
          receivedSymbol: 'VUSD3CRV-f',
          suffixes: transactions.suffixes,
          expectedFee: Big(fromUnit(transactions.expectedFee)).toFixed(4),
          operation: 'curve-modal-title-deposit',
          sent: fixedAmount,
          estimatedReceive: Big(_vusdAmount).times(1).round(4, 0).toFixed(4)
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
        registerLPToken()
        addTransactionStatus({
          internalTransactionId,
          transactionStatus: status ? 'confirmed' : 'canceled',
          fee: Big(fromUnit(fees)).toFixed(4),
          received: status && Big(fromUnit(received)).round(4, 0).toFixed(4)
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

  const vusdHandleChange = function (e) {
    const re = /^([0-9]\d*(\.)\d*|0?(\.)\d*[0-9]\d*|[0-9]\d*)$/
    if (e.target.value === '' || re.test(e.target.value)) {
      setvusdAmount(e.target.value)
    }
  }

  useEffect(
    function () {
      setvusdAmount('')
    },
    [vusdBalance, active]
  )

  return (
    <div className="flex flex-wrap py-4 w-80 space-y-6">
      <div className="w-full">
        <Input
          disabled={!vusdAvailable || !active}
          onChange={vusdHandleChange}
          onSuffixClick={handleVusdMaxAmountClick}
          suffix="MAX"
          title={t('curve-input-title-deposit', { symbol: vusdToken.symbol })}
          value={vusdAmount}
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
          disabled={depositDisabled}
          onClick={() => handleDeposit(vusdToken, vusdAmount)}
        >
          {t('curve-button-deposit')}
        </Button>
      </div>
    </div>
  )
}

export default CurveDeposit

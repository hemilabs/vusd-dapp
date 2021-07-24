import { useWeb3React } from '@web3-react/core'
import Big from 'big.js'
import { useContext, useEffect, useState } from 'react'
import useTranslation from 'next-translate/useTranslation'
import { fromUnit, toFixed, toUnit } from '../utils'
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
  const {
    vusdBalance,
    curveBalance,
    removeCurveLiquidity,
    calcLpWithdraw,
    calcWithdraw
  } = vusd
  const [amount, setAmount] = useState('')

  const [amountVusd, setAmountVusd] = useState(0)
  const { t } = useTranslation('common')
  const formatNumber = useNumberFormat()

  const fixedVusdBalance = toFixed(fromUnit(vusdBalance || 0), 4)
  const fixedCurveBalance = toFixed(fromUnit(curveBalance || 0), 4)
  const withdrawDisabled =
    Big(0).gte(Big(amount || 0)) ||
    Big(toUnit(amount || 0, 18)).gt(Big(toUnit(amountVusd) || 0))

  const vusdToken = {
    address: '0x677ddbd918637E5F2c79e164D402454dE7dA8619',
    chainId: 1,
    decimals: 18,
    logoURI:
      'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
    name: 'VUSD',
    symbol: 'VUSD'
  }

  const lpToken = {
    chainId: 1,
    logoURI:
      'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
    name: 'VUSD3CRV-f',
    symbol: 'VUSD3CRV-f',
    address: '0x4dF9E1A764Fb8Df1113EC02fc9dc75963395b508',
    decimals: 18
  }

  useEffect(
    function () {
      setAmount('')
      if (active) {
        calcWithdraw(curveBalance).then(function (result) {
          setAmountVusd(fromUnit(result))
        })
      }
    },
    [vusdBalance]
  )

  const handleMaxAmountClick = function () {
    active &&
      calcWithdraw(curveBalance).then(function (result) {
        setAmountVusd(fromUnit(result))
        return curveBalance && setAmount(fromUnit(result))
      })
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
            operation: 'curve-modal-title-withdraw',
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
    const re = /^([0-9]\d*(\.)\d*|0?(\.)\d*[0-9]\d*|[0-9]\d*)$/
    if (e.target.value === '' || re.test(e.target.value)) {
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
          suffix="MAX"
          title={`${t('curve-input-title-withdraw')} ${vusdToken.symbol}`}
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
          disabled={!curveBalance || withdrawDisabled}
          onClick={() => handleWithdraw(lpToken, amount)}
        >
          {t('curve-button-withdraw')}
        </Button>
      </div>
    </div>
  )
}

export default CurveWithdraw

import Big from 'big.js'
import { useContext, useEffect, useState } from 'react'
import useTranslation from 'next-translate/useTranslation'
import { ONLY_NUMBERS_REGEX, fromUnit, toFixed, toUnit } from '../utils'
import getErrorKey from '../utils/errorKeys'
import Button from './Button'
import Input from './Input'
import TokenSelector from './TokenSelector'
import TransactionContext from './TransactionContext'
import VusdContext from './context/Vusd'
import { useNumberFormat } from '../hooks/useNumberFormat'
import watchAsset from 'wallet-watch-asset'
import { useWeb3React } from '@web3-react/core'

const Redeem = function () {
  const { addTransactionStatus } = useContext(TransactionContext)
  const { vusd } = useContext(VusdContext)
  const { redeem, tokensData, vusdBalance } = vusd
  const [selectedToken, setSelectedToken] = useState({})
  const [amount, setAmount] = useState('')
  const { t } = useTranslation('common')
  const formatNumber = useNumberFormat()

  const redeemableTokens = tokensData.filter(({ redeemable }) => redeemable)

  const fixedVUSBalance = toFixed(fromUnit(vusdBalance || 0), 4)
  const vusdAvailable = Big(vusdBalance || 0).gt(0)
  const redeemDisabled =
    Big(0).gte(Big(amount || 0)) ||
    Big(toUnit(amount || 0)).gt(Big(selectedToken.walletRedeemable || 0))

  useEffect(
    function () {
      setAmount('')
    },
    [selectedToken.symbol]
  )

  const handleMaxAmountClick = () =>
    vusdAvailable && setAmount(fromUnit(selectedToken.walletRedeemable))

  const { account } = useWeb3React()

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
          title: 'redeem',
          sent: fixedAmount,
          estimatedReceive: Big(mintAmount)
            .times(1 - token.redeemFee)
            .round(4, 0)
            .toFixed(4),
          redeemFee: token.redeemFee
        })
        return transactions.suffixes.forEach(function (suffix, idx) {
          emitter.on(`transactionHash-${suffix}`, transactionHash =>
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
        watchAsset({ account, token: selectedToken })
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
    if (e.target.value === '' || ONLY_NUMBERS_REGEX.test(e.target.value)) {
      setAmount(e.target.value)
    }
  }

  return (
    <div className="flex flex-wrap py-4 w-full space-y-6">
      <div className="w-full">
        <TokenSelector
          balanceKey="walletRedeemable"
          decimals="18"
          selectedToken={selectedToken}
          setSelectedToken={setSelectedToken}
          tokensList={redeemableTokens}
        />
      </div>
      <div className="w-full">
        <Input
          disabled={!vusdAvailable}
          onChange={handleChange}
          onSuffixClick={() => handleMaxAmountClick()}
          suffix={t('max')}
          title={t('amount')}
          value={amount}
        />
      </div>
      <div className="flex justify-between w-full text-left text-gray-400 text-xs">
        <div className="font-semibold">{t('current-vusd-balance')}:</div>
        <div className="font-sm">{formatNumber(fixedVUSBalance)}</div>
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

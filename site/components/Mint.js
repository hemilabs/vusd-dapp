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
import { useWeb3React } from '@web3-react/core'
import watchAsset from 'wallet-watch-asset'
import { findBySymbol } from 'vusd-lib'

const vusdToken = findBySymbol('VUSD')

const Mint = function () {
  const { addTransactionStatus } = useContext(TransactionContext)
  const { vusd } = useContext(VusdContext)
  const { mint, tokensData, vusdBalance } = vusd
  const [selectedToken, setSelectedToken] = useState({})
  const [amount, setAmount] = useState('')
  const { t } = useTranslation('common')

  const mintableTokens = tokensData.filter(({ mintable }) => mintable)

  const formatNumber = useNumberFormat()

  const fixedVusdBalance = toFixed(fromUnit(vusdBalance || 0), 4)
  const tokenAvailable = Big(selectedToken.balance || 0).gt(0)
  const mintDisabled =
    Big(0).gte(Big(amount || 0)) ||
    Big(toUnit(amount || 0, selectedToken.decimals)).gt(
      Big(selectedToken.balance || 0)
    )

  const handleMaxAmountClick = () =>
    tokenAvailable &&
    setAmount(fromUnit(selectedToken.balance, selectedToken.decimals))

  const { account } = useWeb3React()

  const handleMint = function (token, mintAmount) {
    const fixedAmount = Big(mintAmount).round(4, 0).toFixed(4)
    const internalTransactionId = Date.now()
    const { emitter } = mint(token.address, toUnit(mintAmount, token.decimals))
    setTimeout(function () {
      setAmount('')
    }, 3000)
    return emitter
      .on('transactions', function (transactions) {
        addTransactionStatus({
          internalTransactionId,
          transactionStatus: 'created',
          sentSymbol: token.symbol,
          receivedSymbol: 'VUSD',
          suffixes: transactions.suffixes,
          expectedFee: Big(fromUnit(transactions.expectedFee)).toFixed(4),
          operation: 'mint',
          title: 'mint',
          sent: fixedAmount,
          estimatedReceive: Big(mintAmount)
            .times(1 - token.mintingFee)
            .round(4, 0)
            .toFixed(4),
          mintFee: token.mintingFee,
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
          received: status && Big(fromUnit(received)).round(4, 0).toFixed(4)
        })
        watchAsset({ account, token: vusdToken })
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

  useEffect(
    function () {
      setAmount('')
    },
    [selectedToken.symbol]
  )

  return (
    <div className="flex flex-wrap py-4 w-full space-y-6">
      <div className="w-full">
        <TokenSelector
          balanceKey="balance"
          selectedToken={selectedToken}
          setSelectedToken={setSelectedToken}
          tokensList={mintableTokens}
        />
      </div>
      <div className="w-full">
        <Input
          disabled={!tokenAvailable}
          onChange={handleChange}
          onSuffixClick={handleMaxAmountClick}
          suffix={t('max')}
          title={t('amount')}
          value={amount}
        />
      </div>
      <div className="flex justify-between w-full text-gray-400 text-xs">
        <div className="font-semibold">{t('current-vusd-balance')}:</div>
        <div className="font-sm">{formatNumber(fixedVusdBalance)}</div>
      </div>
      <div className="w-full">
        <Button
          disabled={mintDisabled}
          onClick={() => handleMint(selectedToken, amount)}
        >
          {t('mint')}
        </Button>
      </div>
    </div>
  )
}

export default Mint

import useTranslation from 'next-translate/useTranslation'
import SvgContainer from './svg/SvgContainer'
import JustifiedBetweenRow from './JustifiedBetweenRow'
import Modal from './Modal'
import { useNumberFormat } from '../hooks/useNumberFormat'

const TransactionModalRow = function ({ text, value, tipLink }) {
  return (
    <JustifiedBetweenRow
      keyComponent={
        <p
          className={`text-gray-350 text-sm${
            tipLink ? ' flex justify-bewtween cursor-pointer' : ''
          }`}
          onClick={() => tipLink && window.open(tipLink, '_blank')}
        >
          {text}
          {tipLink ? (
            <SvgContainer className="ml-1" name="questionmark" />
          ) : null}
        </p>
      }
      valueComponent={<p className="text-sm font-semibold">{value}</p>}
    />
  )
}

// eslint-disable-next-line complexity
const TransactionsModal = function ({ transaction, modalIsOpen, closeModal }) {
  const { t } = useTranslation('common')
  const formatNumber = useNumberFormat()
  const isConfirmed = transaction.transactionStatus === 'confirmed'
  const isMint = transaction.operation === 'mint'
  const isLiquidity = transaction.operation === 'liquidity'
  const isError =
    transaction.transactionStatus === 'canceled' ||
    transaction.transactionStatus === 'error'
  return (
    <Modal
      className="md:w-105 relative flex flex-col w-full h-screen bg-white border-0 outline-none focus:outline-none shadow-lg md:h-auto md:rounded-lg"
      modalIsOpen={modalIsOpen}
      onRequestClose={closeModal}
    >
      <div key={transaction.internalTransactionId}>
        <div className="p-6">
          <div className="border-b">
            <button className="float-right" onClick={closeModal}>
              <SvgContainer name="close" />
            </button>
            <p className="mb-2 font-bold">{t(`${transaction.title}`)}</p>
          </div>
          <div className="mt-4">
            {transaction.sent && (
              <div className="flex justify-between mb-4 pb-2 border-b border-gray-300">
                <div>
                  <p className="text-lg font-bold">
                    <span>
                      <SvgContainer
                        className="inline mr-3"
                        height="33"
                        name={transaction.sentSymbol}
                        width="33"
                      />
                      {transaction.received && isLiquidity
                        ? formatNumber(transaction.received)
                        : formatNumber(transaction.sent)}
                    </span>
                  </p>
                </div>
                {!isLiquidity && (
                  <>
                    {' '}
                    <div className="text-2xl">→</div>
                    <div className="text-lg font-bold">
                      {isConfirmed
                        ? formatNumber(transaction.received)
                        : formatNumber(transaction.estimatedReceive)}
                      <SvgContainer
                        className="inline ml-3"
                        height="33"
                        name={transaction.receivedSymbol}
                        width="33"
                      />
                    </div>
                  </>
                )}
              </div>
            )}
            {isMint && (
              <TransactionModalRow
                text={t('mint-fee')}
                tipLink="/"
                value={`${formatNumber(
                  (transaction.mintFee * 100).toFixed(2)
                )}%`}
              />
            )}
            {transaction.redeemFee && (
              <TransactionModalRow
                text={isMint ? t('current-redeem-fee') : t('redeem-fee')}
                tipLink="/"
                value={`${formatNumber(
                  (transaction.redeemFee * 100).toFixed(2)
                )}%`}
              />
            )}
            <div className="py-4">
              <TransactionModalRow
                text={t('total-transactions')}
                value={transaction.suffixes && transaction.suffixes.length}
              />
              <TransactionModalRow
                text={isConfirmed ? t('total-tx-fee') : t('estimated-tx-fee')}
                value={`${
                  isConfirmed
                    ? formatNumber(transaction.fee)
                    : formatNumber(transaction.expectedFee)
                } ETH`}
              />
              <JustifiedBetweenRow
                keyComponent={
                  <p className="text-gray-350 text-sm">
                    {t('global-tx-status')}
                  </p>
                }
                valueComponent={
                  <p className="text-sm font-semibold">
                    {t(`status-${transaction.transactionStatus}`)}
                  </p>
                }
              />
            </div>
            {!isError &&
              transaction.suffixes &&
              transaction.suffixes.map((suffix, idx) => (
                <div className="py-4 border-t border-gray-300" key={suffix}>
                  <TransactionModalRow
                    text={t('transaction')}
                    value={`${idx + 1}/${transaction.suffixes.length}`}
                  />
                  <TransactionModalRow
                    text={t('status')}
                    value={
                      transaction[`transactionStatus-${idx}`]
                        ? t(`status-${transaction[`transactionStatus-${idx}`]}`)
                        : t('status-waiting-wallet')
                    }
                  />
                  {transaction[`transactionHash-${idx}`] && (
                    <>
                      <TransactionModalRow
                        text={t('transaction-hash')}
                        value={`${transaction[`transactionHash-${idx}`].slice(
                          0,
                          8
                        )}...${transaction[`transactionHash-${idx}`].slice(
                          -4
                        )}`}
                      />
                      <a
                        className="text-xs"
                        href={`https://etherscan.io/tx/${
                          transaction[`transactionHash-${idx}`]
                        }`}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        {t('view-on-etherscan')}
                      </a>
                    </>
                  )}
                </div>
              ))}
            <div className="pt-4 border-t border-gray-300">
              <SvgContainer
                className="m-auto"
                name={isConfirmed ? 'checkmark' : isError ? 'cross' : 'loading'}
              />
              {transaction.message && (
                <p className="mt-1 text-center">
                  <span className="text-red-600 text-sm font-semibold">
                    {transaction.message}
                  </span>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}
export default TransactionsModal

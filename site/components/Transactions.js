import { useContext } from 'react'
import TransactionContext from './TransactionContext'
import TransactionsModal from './TransactionsModal'

function Transactions() {
  const {
    currentTransactions,
    modalIsOpen,
    closeModal,
    openedInternalTransactionId
  } = useContext(TransactionContext)

  if (!currentTransactions || currentTransactions.length === 0) {
    return null
  }
  return (
    currentTransactions &&
    currentTransactions.length > 0 &&
    currentTransactions.map(
      (transaction) =>
        transaction.internalTransactionId === openedInternalTransactionId && (
          <TransactionsModal
            closeModal={closeModal}
            key={openedInternalTransactionId}
            modalIsOpen={modalIsOpen}
            transaction={transaction}
          />
        )
    )
  )
}

export default Transactions

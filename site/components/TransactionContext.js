import { createContext, useCallback, useEffect, useState } from 'react'

const TransactionContext = createContext()

export function TransactionContextProvider({ children }) {
  const [transactions, setTransactions] = useState([])
  const [currentTransactions, setCurrentTransactions] = useState([])
  const [modalIsOpen, setModalIsOpen] = useState(false)
  const [openedInternalTransactionId, setOpenedInternalTransactionId] =
    useState({})

  const openModal = function ({ internalTransactionId }) {
    setOpenedInternalTransactionId(internalTransactionId)
    setModalIsOpen(true)
  }
  const closeModal = () => setModalIsOpen(false)

  useEffect(
    function () {
      if (transactions.length > 0) {
        const groupedTransactions = transactions.reduce(
          (result, transaction) => ({
            ...result,
            [transaction.internalTransactionId]: result[
              transaction.internalTransactionId
            ]
              ? { ...result[transaction.internalTransactionId], ...transaction }
              : transaction
          }),
          {}
        )
        setCurrentTransactions(Object.values(groupedTransactions))
      }
    },
    [transactions]
  )

  useEffect(
    function () {
      if (currentTransactions.length > 0) {
        openModal(currentTransactions[currentTransactions.length - 1])
      }
    },
    [currentTransactions]
  )

  const addTransactionStatus = useCallback(
    function (newTransaction) {
      setTransactions(previousTransactions => [
        ...previousTransactions,
        newTransaction
      ])
    },
    [transactions]
  )

  return (
    <TransactionContext.Provider
      value={{
        addTransactionStatus,
        currentTransactions,
        modalIsOpen,
        closeModal,
        openedInternalTransactionId
      }}
    >
      {children}
    </TransactionContext.Provider>
  )
}

export default TransactionContext

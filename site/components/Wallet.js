import { useWeb3React } from '@web3-react/core'
import useTranslation from 'next-translate/useTranslation'
import { useEffect, useState } from 'react'

import shortAccount from '../utils/account'
import { injected, walletconnect, walletlink } from '../utils/connectors'

import WalletConnectionErrorHandler from './WalletConnectionErrorHandler'
import WalletConnectionModal from './WalletConnectionModal'
const persistLastConnectorKey = 'lastConnector'

const persistLastConnector = connectorName =>
  window.localStorage.setItem(persistLastConnectorKey, connectorName)
const getLastConnector = () =>
  window.localStorage.getItem(persistLastConnectorKey)
const removeLastConnector = () =>
  window.localStorage.removeItem(persistLastConnectorKey)

const Wallet = function () {
  const { account, active, activate, connector, deactivate, error, setError } =
    useWeb3React()
  const { t } = useTranslation('common')
  const shortenedAccount = shortAccount(account)

  const [activatingConnector, setActivatingConnector] = useState()
  const [showWalletConnector, setShowWalletConnector] = useState(false)
  const [errorModalOpen, setErrorModalOpen] = useState(false)

  useEffect(
    function () {
      if (activatingConnector && activatingConnector === connector) {
        setActivatingConnector(undefined)
      }
    },
    [activatingConnector, connector]
  )

  useEffect(
    function () {
      const lastConnector = getLastConnector()
      setErrorModalOpen(true)
      if (error && lastConnector === 'walletconnect')
        walletconnect.walletConnectProvider = undefined
      if (error) removeLastConnector()
    },
    [error]
  )

  const [tried, setTried] = useState(false)

  useEffect(function () {
    const lastConnector = getLastConnector()
    if (lastConnector === 'injected') {
      injected
        .isAuthorized()
        .then(function (isAuthorized) {
          if (isAuthorized) {
            activate(injected, setError)
          }
        })
        .catch(function () {
          setTried(true)
        })
    } else if (lastConnector === 'walletconnect') {
      activate(walletconnect, setError)
    } else if (lastConnector === 'walletlink') {
      activate(walletlink, setError)
    }
  }, [])

  useEffect(
    function () {
      if (!tried && active) {
        setTried(true)
      }
    },
    [tried, active]
  )

  useEffect(function () {
    const { ethereum } = window
    if (ethereum && ethereum.on && !active && !error) {
      const handleChainChanged = function () {
        activate(injected)
      }

      ethereum.on('chainChanged', handleChainChanged)

      return function () {
        if (ethereum.removeListener) {
          ethereum.removeListener('chainChanged', handleChainChanged)
        }
      }
    }
    return undefined
  }, [])

  const wallets = [
    {
      name: 'Metamask',
      connector: injected,
      handleConnection() {
        setActivatingConnector(injected)
        activate(injected, setError)
        persistLastConnector('injected')
        setShowWalletConnector(false)
        window.gtag('event', `Connected to Metamask`)
      },
      handleDisconnection() {
        deactivate()
        removeLastConnector()
      }
    },
    {
      name: 'WalletConnect',
      connector: walletconnect,
      handleConnection() {
        setActivatingConnector(walletconnect)
        activate(walletconnect, setError)
        persistLastConnector('walletconnect')
        setShowWalletConnector(false)
        window.gtag('event', `Connected to WalletConnect`)
      },
      handleDisconnection() {
        connector.close()
        removeLastConnector()
      }
    },
    {
      name: 'Coinbase Wallet',
      connector: walletlink,
      handleConnection() {
        setActivatingConnector(walletlink)
        activate(walletlink, setError)
        persistLastConnector('walletlink')
        setShowWalletConnector(false)
        window.gtag('event', `Connected to Coinbase Wallet`)
      },
      handleDisconnection() {
        connector.close()
        removeLastConnector()
      }
    }
  ]

  const deactivateConnector = function () {
    wallets.find(w => w.connector === connector).handleDisconnection()
  }

  return (
    <>
      <WalletConnectionModal
        modalIsOpen={showWalletConnector}
        onRequestClose={() => setShowWalletConnector(false)}
        wallets={wallets}
      />
      <WalletConnectionErrorHandler
        error={error}
        modalIsOpen={errorModalOpen}
        onRequestClose={() => setErrorModalOpen(false)}
      />
      {!active ? (
        <button
          className="hover:text-gray-200 text-gray-400 font-semibold focus:outline-none"
          onClick={() => setShowWalletConnector(true)}
        >
          {t('connect-wallet')}
        </button>
      ) : (
        <div className="pt-2 text-center md:pt-0 md:text-right">
          <p className="text-gray-400 text-xs font-semibold">{t('address')}:</p>
          <div>
            <div className="font-bold focus:outline-none">
              {shortenedAccount}
            </div>
          </div>
          <div>
            <button
              className={`text-sm ${
                !account && 'hidden'
              } text-sm font-semibold text-vesper focus:outline-none`}
              onClick={deactivateConnector}
            >
              {t('disconnect')}
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default Wallet

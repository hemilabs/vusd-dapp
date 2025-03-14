import Big from 'big.js'
import { useWeb3React } from '@web3-react/core'
import { createContext, useCallback, useEffect, useState } from 'react'
import createVusdLib from 'vusd-lib'

/**
 * This component must be a child of <App> to have access to the appropriate
 * context
 */

const VusdContext = createContext()

export const VusdContextProvider = function ({
  children,
  tokensInitialData,
  vusdInitialData
}) {
  const { active, library, account } = useWeb3React()
  const [vusdLib, setVusdLib] = useState({})
  const [vusd, setVusd] = useState({
    tokensData: tokensInitialData,
    ...vusdInitialData
  })

  const mergeTokenData = (tokens, walletBalances, vusdBalance) =>
    tokens.map(token => ({
      ...token,
      walletRedeemable: Big(token.redeemableVusd).lt(vusdBalance)
        ? token.redeemableVusd
        : vusdBalance,
      balance:
        token.mintable &&
        walletBalances.find(t => t.address === token.address).balance
    }))
  const updateData = useCallback(
    function () {
      const promises = [
        vusdLib.getTokens(),
        vusdLib.getUserBalances(),
        vusdLib.getVusdBalance(),
        vusdLib.getVusdSupply()
      ]
      return Promise.all(promises)
        .then(([tokens, walletBalances, vusdBalance, totalSupply]) => ({
          tokensData: mergeTokenData(tokens, walletBalances, vusdBalance),
          vusdBalance,
          totalSupply,
          ...vusdLib
        }))
        .then(setVusd)
        .catch(e => console.warn(e.message))
    },
    [vusdLib]
  )

  useEffect(
    function () {
      if (!vusdLib.getTokens || !library) {
        return undefined
      }
      const subscription = library.eth.subscribe('newBlockHeaders')
      if (!active) {
        return subscription.unsubscribe()
      }
      updateData()
      subscription
        .on('data', function () {
          updateData()
        })
        .on('error', function (err) {
          console.warn(err.message)
        })
      return () => subscription.unsubscribe()
    },
    [vusdLib, active]
  )

  useEffect(
    function () {
      if (!active) {
        setVusd({ tokensData: tokensInitialData, ...vusdInitialData })
      } else {
        setVusdLib(createVusdLib(library, { from: account }))
      }
    },
    [active, library, account]
  )

  return (
    <VusdContext.Provider value={{ vusd }}>{children}</VusdContext.Provider>
  )
}

export default VusdContext

import Big from 'big.js'
import { useWeb3React } from '@web3-react/core'
import { createContext, useCallback, useEffect, useState } from 'react'
import createVusdLib from 'vusd-lib'

/**
 * This component must be a child of <App> to have access to the appropriate
 * context
 */

const VusdContext = createContext()

export const VusdContextProvider = function ({ children, tokensInitialData }) {
  const { active, library, account } = useWeb3React()
  const [vusdLib, setVusdLib] = useState({})
  const [vusd, setVusd] = useState({ tokensData: tokensInitialData })

  const mergeTokenData = (tokens, walletBalances, vusdBalance) =>
    tokens.map((token) => ({
      ...token,
      walletRedeemable: Big(token.redeemable).lt(vusdBalance)
        ? token.redeemable
        : vusdBalance,
      balance: walletBalances.find((t) => t.address === token.address).balance
    }))
  const updateData = useCallback(
    function () {
      const promises = [
        vusdLib.getTokens(),
        vusdLib.getUserBalances(),
        vusdLib.getVusdBalance(),
        vusdLib.getDummyBalance(),
        vusdLib.getCurveBalance()
      ]
      return Promise.all(promises)
        .then(
          ([
            tokens,
            walletBalances,
            vusdBalance,
            dummyBalance,
            curveBalance
          ]) => {
            let ss = {
              tokensData: mergeTokenData(tokens, walletBalances, vusdBalance),
              vusdBalance,
              dummyBalance,
              curveBalance,
              ...vusdLib
            }
            console.log('sss', ss)

            return ss
          }
        )
        .then(setVusd)
        .catch((e) => console.warn(e.message))
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
        setVusd({ tokensData: tokensInitialData })
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

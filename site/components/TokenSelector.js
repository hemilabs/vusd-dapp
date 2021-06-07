import { useWeb3React } from '@web3-react/core'
import Dropdown from './Dropdown'
import { useEffect } from 'react'
import { fromUnit, toFixed } from '../utils'
import SvgContainer from './svg/SvgContainer'

const TokenSelector = function ({
  balanceKey,
  balancePrefix,
  balanceSuffix,
  selectedToken,
  setSelectedToken,
  tokensList,
  decimals
}) {
  const { active } = useWeb3React()

  useEffect(
    function () {
      if (!active || !tokensList) {
        setSelectedToken({})
      } else if (!selectedToken.symbol && tokensList) {
        setSelectedToken(tokensList[0])
      } else {
        setSelectedToken(
          tokensList.find((t) => t.address === selectedToken.address)
        )
      }
    },
    [active, selectedToken, tokensList]
  )

  return (
    <>
      <p className="font-bold text-center text-gray-600 mb-1.5">Token</p>
      <Dropdown
        className={`relative z-10 ${
          !active ? 'cursor-not-allowed bg-gray-50' : ''
        }`}
        disabled={!active}
        selector={
          <div className="flex items-center justify-between w-full h-10 px-4 py-1 font-semibold border border-gray-200 focus:outline-none">
            {active && (
              <>
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center w-full">
                    <SvgContainer
                      className="w-6 h-6 mr-2"
                      name={selectedToken.symbol}
                    />
                    {selectedToken.symbol}
                    {balanceKey && (
                      <span className="ml-2 text-xs font-normal text-gray-400">
                        {balancePrefix}
                        {selectedToken[balanceKey] &&
                          toFixed(
                            fromUnit(
                              selectedToken[balanceKey],
                              decimals || selectedToken.decimals
                            ),
                            4
                          )}
                        {balanceSuffix}
                      </span>
                    )}
                  </div>
                </div>
                <SvgContainer name="caret" />
              </>
            )}
          </div>
        }
      >
        <div className="absolute z-10 w-full pt-2">
          <ul className="w-full bg-white border shadow-lg ">
            {tokensList &&
              tokensList.map((token) => (
                <li key={token.symbol}>
                  <div onClick={() => setSelectedToken(token)}>
                    <div className="flex items-center w-full px-4 py-1 hover:bg-gray-200 justify-bewtween">
                      <div className="flex items-center w-full">
                        <SvgContainer
                          className="w-6 h-6 mr-2"
                          name={token.symbol}
                        />
                        {token.symbol}
                        {balanceKey && (
                          <span className="ml-2 text-xs text-gray-400">
                            {balancePrefix}
                            {token[balanceKey] &&
                              toFixed(
                                fromUnit(
                                  token[balanceKey],
                                  decimals || token.decimals
                                ),
                                4
                              )}
                            {balanceSuffix}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
          </ul>
        </div>
      </Dropdown>
    </>
  )
}

export default TokenSelector

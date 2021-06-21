import { useWeb3React } from '@web3-react/core'
import Dropdown from './Dropdown'
import { useEffect } from 'react'
import { fromUnit, toFixed } from '../utils'
import SvgContainer from './svg/SvgContainer'
import useTranslation from 'next-translate/useTranslation'
import { useNumberFormat } from '../hooks/useNumberFormat'

const TokenSelector = function ({
  balanceKey,
  selectedToken,
  setSelectedToken,
  tokensList,
  decimals
}) {
  const { active } = useWeb3React()
  const { t } = useTranslation('common')
  const formatNumber = useNumberFormat()

  useEffect(
    function () {
      if (!active || !tokensList) {
        setSelectedToken({})
      } else if (!selectedToken.symbol && tokensList) {
        setSelectedToken(tokensList[0])
      } else {
        setSelectedToken(
          tokensList.find((token) => token.address === selectedToken.address)
        )
      }
    },
    [active, tokensList]
  )

  return (
    <>
      <p className="font-bold text-gray-600 mb-1.5">{t('token')}</p>
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
                  </div>
                  {balanceKey && (
                    <div className="mr-2 text-xs font-normal text-gray-400">
                      <span className="mr-1">MAX</span>
                      {selectedToken[balanceKey] &&
                        formatNumber(
                          toFixed(
                            fromUnit(
                              selectedToken[balanceKey],
                              decimals || selectedToken.decimals
                            ),
                            4
                          )
                        )}
                    </div>
                  )}
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
                      </div>
                      {balanceKey && (
                        <div className="mr-6 text-xs text-gray-400">
                          <span className="mr-1">MAX</span>
                          {token[balanceKey] &&
                            formatNumber(
                              toFixed(
                                fromUnit(
                                  token[balanceKey],
                                  decimals || token.decimals
                                ),
                                4
                              )
                            )}
                        </div>
                      )}
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

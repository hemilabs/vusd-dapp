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
          tokensList.find(token => token.address === selectedToken.address)
        )
      }
    },
    [active, tokensList]
  )

  return (
    <>
      <p className="mb-1.5 text-gray-600 font-bold">{t('token')}</p>
      <Dropdown
        className={`relative z-10 ${
          !active ? 'cursor-not-allowed bg-gray-50' : ''
        }`}
        disabled={!active}
        selector={
          <div className="flex items-center justify-between px-4 py-1 w-full h-10 font-semibold border border-gray-200 focus:outline-none">
            {active && (
              <>
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center w-full">
                    <SvgContainer
                      className="mr-2 w-6 h-6"
                      name={selectedToken.symbol}
                    />
                    {selectedToken.symbol}
                  </div>
                  {balanceKey && (
                    <div className="mr-2 text-gray-400 text-xs font-normal">
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
        <div className="absolute z-10 pt-2 w-full">
          <ul className="w-full bg-white border shadow-lg">
            {tokensList &&
              tokensList.map(token => (
                <li key={token.symbol}>
                  <div onClick={() => setSelectedToken(token)}>
                    <div className="justify-bewtween flex items-center px-4 py-1 w-full hover:bg-gray-200">
                      <div className="flex items-center w-full">
                        <SvgContainer
                          className="mr-2 w-6 h-6"
                          name={token.symbol}
                        />
                        {token.symbol}
                      </div>
                      {balanceKey && (
                        <div className="mr-6 text-gray-400 text-xs">
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

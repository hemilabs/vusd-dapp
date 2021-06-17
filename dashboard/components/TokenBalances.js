import Big from 'big.js'
import styles from '../styles/Home.module.css'
import { format, fromUnit } from '../utils/numbers'

export const TokenBalances = function ({ tokens = [] }) {
  if (tokens.length === 0) {
    return (
      <p className={styles.centered}>There are no Tokens in this address</p>
    )
  }
  return (
    <table className={styles.balances}>
      <thead>
        <tr>
          <th colSpan="2">Balance</th>
          <th colSpan="2">Value</th>
        </tr>
      </thead>
      <tbody>
        {tokens.map(({ tokenInfo, rawBalance }) => {
          const { symbol, address, price, decimals } = tokenInfo
          const balanceUsd =
            price && price.rate
              ? Big(fromUnit(rawBalance, decimals)).times(price.rate).toNumber()
              : '-'
          return (
            <tr key={address}>
              <td className={styles.textAlignRight}>
                <span>{format(rawBalance)}</span>
              </td>
              <td>
                <span className={styles.semiBold}>{symbol}</span>
              </td>
              <td className={styles.textAlignRight}>
                <span>{format(balanceUsd)}</span>
              </td>
              <td>
                <span className={styles.semiBold}>USD</span>
              </td>
            </tr>
          )
        })}
      </tbody>
      <tfoot>
        <tr>
          <td
            className={styles.semiBold}
            colSpan="2"
            style={{ textAlign: 'center' }}
          >
            Total
          </td>
          <td className={styles.textAlignRight}>
            <span>
              {format(
                tokens.reduce((accumulator, token) => {
                  const { tokenInfo, rawBalance } = token
                  const { price, decimals } = tokenInfo
                  if (!price || !price.rate) {
                    return accumulator
                  }
                  return accumulator.plus(
                    Big(fromUnit(rawBalance, decimals)).times(price.rate)
                  )
                }, Big(0))
              )}
            </span>
          </td>
          <td>
            <span className={styles.semiBold}>USD</span>
          </td>
        </tr>
      </tfoot>
    </table>
  )
}

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
          <th>Symbol</th>
          <th>Balance</th>
          <th>Value (USD)</th>
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
              <td className={styles.semiBold}>{symbol}</td>
              <td>{format(rawBalance)}</td>
              <td>{format(balanceUsd)}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

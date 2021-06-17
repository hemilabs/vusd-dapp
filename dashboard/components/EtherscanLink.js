const formatShort = function (text) {
  return `${text.substr(0, 6)}...${text.slice(-4)}`
}

const ETHERSCAN_URL = 'https://etherscan.io'

export const EtherscanLink = function ({ address, tx, long = false }) {
  const url = `${ETHERSCAN_URL}${address ? `/address/${address}` : `/tx/${tx}`}`
  const text = address ?? tx
  return (
    <a
      href={url}
      rel="noreferrer"
      target="_blank"
      title={long ? undefined : text}
    >
      {long ? text : formatShort(text)}
    </a>
  )
}

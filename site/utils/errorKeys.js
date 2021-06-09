const knownErrors = [
  4001, 4100, 4200, 4900, 4901, -32700, -32600, -32601, -32602, -32603, -32000,
  -32001, -32002, -32003, -32004, -32005, -32006
]

const getErrorKey = (err) =>
  knownErrors.indexOf(err.code) !== -1
    ? `error-code${err.code}`
    : 'error-unknown'

export default getErrorKey

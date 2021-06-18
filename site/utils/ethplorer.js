const apiKey = process.env.EHTPLORER_API_KEY
const baseURl = 'https://api.ethplorer.io'
const apiFetch = (path, params = {}) =>
  fetch(
    `${baseURl}${path}?${new URLSearchParams({
      ...params,
      apiKey
    }).toString()}`
  ).then((response) => response.json())

export const getAddressInfo = (address) =>
  apiFetch(`/getAddressInfo/${address}`)

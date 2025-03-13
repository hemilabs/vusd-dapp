const apiKey = process.env.EHTPLORER_API_KEY || 'freekey'
const baseURl = 'https://api.ethplorer.io'
const apiFetch = path =>
  fetch(`${baseURl}${path}?${new URLSearchParams({ apiKey }).toString()}`).then(
    response => response.json()
  )

export const getAddressInfo = address => apiFetch(`/getAddressInfo/${address}`)

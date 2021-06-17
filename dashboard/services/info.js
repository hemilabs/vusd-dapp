const API_URL = process.env.NEXT_PUBLIC_API_URL
export const getAddressInfo = (address) =>
  fetch(`${API_URL}/info/${address}`).then((response) => response.json())

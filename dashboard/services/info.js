export const getAddressInfo = (address) =>
  fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard-info/${address}`).then(
    (response) => response.json()
  )

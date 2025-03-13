import { getAddressInfo } from '../../../utils/ethplorer'
import { withCors } from '../../../utils/withCors'

export default withCors(function (req, res) {
  if (!req.query.address.test(/0x[0-9a-fA-F]{40}/)) {
    res.status(400).json({ error: 'Invalid address' })
  }
  return getAddressInfo(req.query.address).then(info =>
    res.status(200).json(info)
  )
})

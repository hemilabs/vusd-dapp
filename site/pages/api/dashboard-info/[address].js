import { withCors } from '../../../utils/withCors'
import { getAddressInfo } from '../../../utils/ethplorer'

export default withCors((req, res) =>
  getAddressInfo(req.query.address).then(info => res.status(200).json(info))
)

'use strict'
import { getVusd } from '../../utils/getDataSS'

export default function handler(req, res) {
  return getVusd().then((vusd) => res.status(200).json(vusd))
}

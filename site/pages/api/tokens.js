'use strict'
import getTokensSS from '../../utils/getTokensSS'
import { withCors } from '../../utils/withCors'

export default withCors(function handler(req, res) {
  return getTokensSS().then((tokens) => res.status(200).json(tokens))
})

'use strict'
import getTokensSS from '../../utils/getTokensSS'

export default function handler(req, res) {
  return getTokensSS().then((tokens) => res.status(200).json(tokens))
}

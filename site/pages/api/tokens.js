import { getTokens } from '../../utils/getDataSS'

export default function handler(req, res) {
  return getTokens().then((tokens) => res.status(200).json(tokens))
}

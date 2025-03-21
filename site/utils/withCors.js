import Cors from 'cors'

const allowedOrigins =
  process.env.ALLOWED_SITES === '*'
    ? '*'
    : process.env.ALLOWED_SITES?.split(',') ?? false
// Initializing the cors middleware
const cors = Cors({
  methods: ['GET', 'HEAD'],
  origin: allowedOrigins
})

// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
const runMiddleware = (req, res, fn) =>
  new Promise((resolve, reject) => {
    fn(req, res, result => {
      if (result instanceof Error) {
        return reject(result)
      }

      return resolve(result)
    })
  })

export const withCors = handlerFn => (req, res) =>
  runMiddleware(req, res, cors).then(() => handlerFn(req, res))

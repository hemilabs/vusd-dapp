import * as Sentry from '@sentry/nextjs'
import Error from 'next/error'

const CustomErrorComponent = props => <Error statusCode={props.statusCode} />

CustomErrorComponent.getInitialProps = async function (contextData) {
  await Sentry.captureUnderscoreErrorException(contextData)
  return Error.getInitialProps(contextData)
}

export default CustomErrorComponent

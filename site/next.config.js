const { withSentryConfig } = require('@sentry/nextjs')
const { createSecureHeaders } = require('next-secure-headers')
const nextTranslate = require('next-translate')

const isProd = process.env.NODE_ENV === 'production'

const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN
const sentryOrigin = sentryDsn ? new URL(sentryDsn).origin : ''

const nextConfig = {
  headers: async () => [
    {
      headers: createSecureHeaders({
        contentSecurityPolicy: {
          directives: {
            connectSrc: ["'self'", ...(sentryDsn ? [sentryOrigin] : [])],
            defaultSrc: "'self'",
            fontSrc: ["'self'", 'https://fonts.gstatic.com'],
            scriptSrc: [
              "'self'",
              "'unsafe-inline'",
              ...(isProd ? [] : ["'unsafe-eval'"]),
              ...(sentryDsn ? [sentryOrigin] : []),
              'https://www.googletagmanager.com'
            ],
            styleSrc: [
              "'self'",
              "'unsafe-inline'",
              'https://fonts.googleapis.com'
            ],
            workerSrc: ["'self'", 'blob:']
          }
        }
      }),
      source: '/:path*'
    }
  ]
}

// https://github.com/getsentry/sentry-webpack-plugin#options
const userSentryWebpackPluginOptions = {
  org: 'hemi-labs',
  project: 'vusd',
  silent: !process.env.CI
}

// https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
const sentryOptions = {
  disableLogger: true,
  hideSourceMaps: true,
  widenClientFileUpload: true
}

module.exports = withSentryConfig(
  nextTranslate(nextConfig),
  userSentryWebpackPluginOptions,
  sentryOptions
)

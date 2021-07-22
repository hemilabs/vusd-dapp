import Head from 'next/head'

const trackingId = process.env.NEXT_PUBLIC_ANALYTICS_ID

const CustomHead = ({ title }) => (
  <Head>
    <script
      async
      src={`https://www.googletagmanager.com/gtag/js?id=${trackingId}`}
    ></script>
    <script
      dangerouslySetInnerHTML={{
        __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${trackingId}');
        `
      }}
    />
    <title>VUSD{title && ` | ${title}`}</title>
    <link href="/favicon.ico" rel="icon" />
  </Head>
)

export default CustomHead

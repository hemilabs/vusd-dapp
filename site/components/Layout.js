import BetaRibbon from './BetaRibbon'
import Footer from './Footer'
import Head from './Head'
import Navbar from './Navbar'

const Layout = ({ children, title, walletConnection }) => (
  <div className="h-full min-h-screen bg-gradient-to-b from-white to-indigo-300">
    <Head title={title} />
    <BetaRibbon />
    <div className="max-w-customscreen mx-auto px-8 py-4 w-full xl:px-0">
      <Navbar walletConnection={walletConnection} />
      <div className="md:pt-19 md:min-h-content mx-auto pb-8 pt-6 w-full md:pb-0">
        {children}
      </div>
      <Footer />
    </div>
  </div>
)

export default Layout

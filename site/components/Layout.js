import Navbar from './Navbar'
import Footer from './Footer'
import Head from './Head'

const Layout = ({ children, title, walletConnection }) => (
  <div className="h-full min-h-screen bg-gradient-to-b from-white to-indigo-300">
    <Head title={title} />
    <div className="w-full px-8 py-4 mx-auto max-w-customscreen xl:px-0">
      <Navbar walletConnection={walletConnection} />
      <div className="w-full pt-6 pb-8 mx-auto md:pb-0 md:pt-19 md:min-h-content">
        {children}
      </div>
      <Footer />
    </div>
  </div>
)

export default Layout

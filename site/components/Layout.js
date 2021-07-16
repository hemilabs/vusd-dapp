import Navbar from './Navbar'
import Footer from './Footer'
import Head from './Head'

const Layout = ({ children, title, walletConnection }) => (
  <div className="h-full min-h-screen">
    <Head title={title} />
    <div className="w-full px-8 py-4 mx-auto max-w-customscreen xl:px-0">
      <Navbar walletConnection={walletConnection} />
      <div className="w-full pt-8 pb-8 pl-8 pr-8 mx-auto   md:pb-0 md:pt-8 md:min-h-content">
        {children}
      </div>
      <Footer />
    </div>
  </div>
)

export default Layout

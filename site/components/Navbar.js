import Link from 'next/link'
import Wallet from './Wallet'
import SvgContainer from './svg/SvgContainer'

const Navbar = ({ walletConnection }) => {
  return (
    <div className="flex flex-wrap items-center justify-between w-full h-24 border-b-2">
      <div>
        <Link href="/">
          <a className="text-xl font-bold">
            <SvgContainer name="vusdlogo" />
          </a>
        </Link>
      </div>
      <div className="mt-4 md:mt-0">{walletConnection && <Wallet />}</div>
    </div>
  )
}

export default Navbar

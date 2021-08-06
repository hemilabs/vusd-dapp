import Link from 'next/link'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'

const AppLink = ({ href, text }) => {
  const { pathname } = useRouter()
  const selected = pathname === href
  return (
    <Link href={href}>
      <a className={!selected ? 'opacity-25' : ''}>{text}</a>
    </Link>
  )
}

const AppSelector = () => {
  const { t } = useTranslation('common')
  return (
    <div className="text-vesper flex mb-2 text-sm font-bold uppercase space-x-4">
      <AppLink href="/" text={`${t('mint')} / ${t('redeem')}`} />
      <AppLink href="/liquidity" text={t('curve-title')} />
    </div>
  )
}

export default AppSelector

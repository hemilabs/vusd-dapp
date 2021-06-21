import Link from 'next/link'
import LanguageSelector from './LanguageSelector'
import useTranslation from 'next-translate/useTranslation'

const Footer = function () {
  const { t } = useTranslation('common')
  return (
    <div className="flex flex-wrap justify-center w-full">
      <div className="flex justify-between w-full mt-20 text-xs font-semibold text-vesper space-x-4">
        <LanguageSelector />
        <div className="w-1/2 text-right">
          <p>
            {t('copyright')} {t('sponsored-by')}
            <Link href="https://vesper.finance">
              <a
                className="ml-1 text-gray-800 underline"
                rel="noreferrer"
                target="_blank"
              >
                Vesper
              </a>
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Footer

import Link from 'next/link'
import LanguageSelector from './LanguageSelector'
import useTranslation from 'next-translate/useTranslation'

const Footer = function () {
  const { t } = useTranslation('common')
  return (
    <div className="flex flex-wrap justify-center w-full">
      <div className="text-vesper flex justify-between mt-20 w-full text-xs font-semibold space-x-4">
        <LanguageSelector />
        <div className="w-1/2 text-right">
          <p>
            {t('copyright')} {t('sponsored-by')}
            <Link href="https://hemi.xyz">
              <a
                className="ml-1 text-gray-800 underline"
                rel="noreferrer"
                target="_blank"
              >
                Hemi
              </a>
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Footer

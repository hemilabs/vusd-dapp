import useTranslation from 'next-translate/useTranslation'

const Ribbon = function () {
  const { t } = useTranslation('common')
  return (
    <div className="mb-4 h-6">
      <div className="bg-vusd fixed z-10 py-2 w-full text-white">
        <div className="flex gap-6 items-center justify-center w-full">
          {`⚠ ${t('vetro-note')}`}
          <a
            className="text-vusd inline-block py-1 w-32 text-center text-sm bg-white hover:bg-opacity-75 rounded-md focus:outline-none"
            href="https://vetro.org"
            rel="noopener noreferrer"
            target="_blank"
          >
            {t('vetro-link')}
          </a>
        </div>
      </div>
    </div>
  )
}

export default Ribbon

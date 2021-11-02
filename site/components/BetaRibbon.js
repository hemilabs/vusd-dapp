import useTranslation from 'next-translate/useTranslation'

const BetaRibbon = function () {
  const { t } = useTranslation('common')
  return (
    <div className="mb-4 h-6">
      <div className="fixed z-10 py-2 w-full bg-white">
        <div className="flex items-center justify-center w-full">
          {`🛠 ${t('beta-ribbon')} 🛠`}
        </div>
      </div>
    </div>
  )
}

export default BetaRibbon

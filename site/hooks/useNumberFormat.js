import useTranslation from 'next-translate/useTranslation'

export const useNumberFormat = function () {
  const { lang } = useTranslation()
  const formatNumber = number =>
    Intl.NumberFormat(lang, { minimumFractionDigits: 2 }).format(number)
  return formatNumber
}

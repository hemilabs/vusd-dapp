import Modal from './Modal'
import { useEffect, useState } from 'react'
import useTranslation from 'next-translate/useTranslation'

const BetaModal = function () {
  const { t } = useTranslation('common')
  const storageKey = 'beta-conditions-accepted'
  const [modalIsOpen, setModalIsOpen] = useState(false)
  const closeModal = function () {
    window.localStorage.setItem(storageKey, 'true')
    setModalIsOpen(false)
  }
  useEffect(function () {
    if (window.localStorage.getItem(storageKey) !== 'true') {
      setModalIsOpen(true)
    }
  }, [])
  return (
    <Modal className="p-4 bg-white rounded-md" modalIsOpen={modalIsOpen}>
      <div className="flex justify-center w-full text-center">
        <div className="flex items-center justify-center w-32 h-32 text-5xl bg-gray-200 rounded-full">
          🛠
        </div>
      </div>
      <div className="py-6 w-72 text-center">
        <p className="p-2 font-bold">{t('beta-title')}</p>
        <p className="text-justify-center p-2 text-gray-400 text-sm">
          {t('beta-description')}
        </p>
      </div>
      <div className="flex flex-wrap w-72 text-white text-base space-y-4">
        <a
          className="bg-vesper flex items-center justify-center py-1 w-full h-12 text-white text-sm font-bold rounded-3xl focus:outline-none hover:opacity-75 uppercase"
          href="https://docs.google.com/document/d/1SdorbmiUP2hjPCrrxjLyDouCffXmuGAM5S0Yec2b0rs/edit"
          rel="noreferrer"
          target="_blank"
        >
          Learn more
        </a>
        <button
          className="py-1 w-full h-12 text-center text-white text-sm font-bold bg-purple-300 rounded-3xl focus:outline-none hover:opacity-75 uppercase"
          onClick={() => closeModal()}
        >
          Got it
        </button>
      </div>
    </Modal>
  )
}

export default BetaModal

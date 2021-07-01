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
    <Modal
      className="p-4 bg-white rounded-md"
      modalIsOpen={modalIsOpen}
      onRequestClose={closeModal}
    >
      <div className="flex justify-center w-full text-center">
        <div className="flex items-center justify-center w-32 h-32 text-5xl bg-gray-200 rounded-full">
          🛠
        </div>
      </div>
      <div className="py-6 text-center w-72">
        <p className="p-2 font-bold">{t('beta-title')}</p>
        <p className="p-2 text-sm text-gray-400 text-justify-center">
          {t('beta-description')}
        </p>
      </div>
      <div className="flex flex-wrap text-base text-white w-72 space-y-4">
        <a
          className="flex items-center justify-center w-full h-12 py-1 text-sm font-bold text-white uppercase rounded-3xl focus:outline-none bg-vesper hover:opacity-75"
          href="https://docs.google.com/document/d/1SdorbmiUP2hjPCrrxjLyDouCffXmuGAM5S0Yec2b0rs/edit"
          rel="noreferrer"
          target="_blank"
        >
          Learn more
        </a>
        <button
          className="w-full h-12 py-1 text-sm font-bold text-center text-white uppercase bg-purple-300 rounded-3xl focus:outline-none hover:opacity-75"
          onClick={() => closeModal()}
        >
          Got it
        </button>
      </div>
    </Modal>
  )
}

export default BetaModal

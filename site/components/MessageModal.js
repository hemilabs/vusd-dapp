import useTranslation from 'next-translate/useTranslation'
import { useState } from 'react'

import Modal from './Modal'

const MessageModal = function () {
  const { t } = useTranslation('common')
  const storageKey = 'redemptions-paused'
  const [modalIsOpen, setModalIsOpen] = useState(true)
  const closeModal = function () {
    setModalIsOpen(false)
  }
  return (
    <Modal className="p-4 bg-white rounded-md" modalIsOpen={modalIsOpen}>
      <div className="flex justify-center w-full text-center">
        <div className="flex items-center justify-center w-32 h-32 text-5xl bg-gray-200 rounded-full">
          ⚠️
        </div>
      </div>
      <div className="py-6 w-72 text-center">
        <p className="p-2 font-bold">{t(`${storageKey}-title`)}</p>
        <p className="p-2 text-center text-gray-400 text-sm">
          {t(`${storageKey}-text`)}
        </p>
      </div>
      <div className="flex flex-wrap w-72 text-white text-base space-y-4">
        <a
          className="bg-vesper flex items-center justify-center py-1 w-full h-12 text-white text-sm font-bold rounded-3xl focus:outline-none hover:opacity-75 uppercase"
          href="https://www.comp.xyz/t/gauntlet-pausing-ethereum-usdc-usds-and-usdt-comets/7326?u=gauntlet"
          rel="noreferrer"
          target="_blank"
        >
          {t(`${storageKey}-cta`)}
        </a>
        <button
          className="py-1 w-full h-12 text-center text-white text-sm font-bold bg-purple-300 rounded-3xl focus:outline-none hover:opacity-75 uppercase"
          onClick={() => closeModal()}
        >
          {t(`${storageKey}-close`)}
        </button>
      </div>
    </Modal>
  )
}

export default MessageModal

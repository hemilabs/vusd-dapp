import { useState } from 'react'
import useTranslation from 'next-translate/useTranslation'
import SvgContainer from './svg/SvgContainer'

const TabSelector = function ({ tabs }) {
  const { t } = useTranslation('common')
  const [selectedTab, setSelectedTab] = useState(tabs[0])
  return (
    <div className="w-full px-2 py-8 bg-white shadow-md md:px-8 xl:px-40 xl:w-160 rounded-md h-105">
      <div className="flex w-full">
        {tabs.map((tab) => (
          <div
            className={`w-24 flex flex-wrap justify-center uppercase text-center text-vesper p-2 rounded-md ${
              tab.name === selectedTab.name
                ? 'bg-purple-200 cursor-not-allowed'
                : 'hover:bg-gray-100 opacity-25 hover:opacity-100'
            }`}
            key={tab.name}
            onClick={() => setSelectedTab(tab)}
          >
            <SvgContainer name={tab.name} />
            <div className="w-full">{t(tab.name)}</div>
          </div>
        ))}
      </div>
      <selectedTab.component />
    </div>
  )
}

export default TabSelector

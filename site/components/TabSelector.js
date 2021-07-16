import { useState } from 'react'
import useTranslation from 'next-translate/useTranslation'

const TabSelector = function ({ tabs, ...props }) {
  const { t } = useTranslation('common')
  const [selectedTab, setSelectedTab] = useState(tabs[0])
  return (
    <div {...props}>
      <div className="flex w-full">
        {tabs.map((tab) => (
          <div
            className={`w-full bg-indigo-100 flex flex-wrap justify-center text-center p-2 rounded-md ${
              tab.name === selectedTab.name
                ? 'bg-indigo-400 text-white cursor-not-allowed'
                : 'hover:bg-indigo-100 opacity-100 text-vesper  hover:opacity-50'
            }`}
            key={tab.name}
            onClick={() => setSelectedTab(tab)}
          >
            <div className="w-full">{t(tab.name)}</div>
          </div>
        ))}
      </div>
      <selectedTab.component />
    </div>
  )
}

export default TabSelector

import { useState } from 'react'

const TabSelector = function ({ tabs, ...props }) {
  const [selectedTab, setSelectedTab] = useState(tabs[0])
  return (
    <div {...props}>
      <div className="flex w-full">
        {tabs.map((tab) => (
          <div
            className={`flex-grow border-b ${
              tab.name === selectedTab.name
                ? 'bg-gray-800 text-white cursor-not-allowed'
                : 'hover:bg-gray-800 hover:text-white'
            }`}
            key={tab.name}
            onClick={() => setSelectedTab(tab)}
          >
            {tab.name}
          </div>
        ))}
      </div>
      <selectedTab.component />
    </div>
  )
}

export default TabSelector

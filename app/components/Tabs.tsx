"use client";

interface TabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Tabs = ({ activeTab, setActiveTab }: TabsProps) => {
  const tabs = ["点菜", "超优惠", "评价", "商家"];
  const tabCounts: { [key: string]: string } = { 评价: "697" };

  return (
    <div className="flex border-b">
      {tabs.map((tab) => (
        <button
          key={tab}
          className={`flex-1 py-3 text-center relative ${
            activeTab === tab ? "text-black font-bold" : "text-gray-500"
          }`}
          onClick={() => setActiveTab(tab)}
        >
          <span>{tab}</span>
          {tabCounts[tab] && (
            <span className="ml-1 text-xs text-gray-400">{tabCounts[tab]}</span>
          )}
          {activeTab === tab && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-400"></div>
          )}
        </button>
      ))}
    </div>
  );
};

export default Tabs;

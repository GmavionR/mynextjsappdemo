const RestaurantInfoCard = () => (
  <div className="bg-white p-4 rounded-lg shadow-md -mt-16">
    <div className="flex flex-col md:flex-row items-start md:items-end">
      <div className="w-24 h-24 bg-gray-300 rounded-lg flex-shrink-0 -mt-8 border-4 border-white"></div>
      <div className="mt-4 md:mt-0 md:ml-4">
        <h1 className="text-2xl font-bold">正宗山东手工水饺</h1>
        <div className="flex flex-wrap items-center text-xs text-gray-500 mt-1 space-x-3">
          <span>评分 4.8</span>
          <span>月售 2000+</span>
          <span>美团快送 约40分钟</span>
        </div>
      </div>
    </div>
    <div className="mt-4 text-xs text-gray-500">
      <p>
        羊, 质量为本。欢迎您光临小店。本店提供手撕定额发票。 手工制作, 拒...
      </p>
    </div>
    <div className="mt-4 flex items-center space-x-2 overflow-x-auto pb-2">
      <div className="bg-red-100 border border-red-500 text-red-500 px-2 py-1 rounded-md flex items-center text-sm flex-shrink-0">
        <span className="font-bold text-red-600">神券</span>
        <span className="font-bold text-lg text-red-600 mx-1">¥18</span>
        <span>满38可用</span>
      </div>
      <div className="bg-red-500 text-white px-3 py-1 rounded-md text-sm flex-shrink-0">
        ¥1 领
      </div>
      <div className="bg-red-500 text-white px-3 py-1 rounded-md text-sm flex-shrink-0">
        ¥20 领
      </div>
      <span className="text-red-500 text-sm flex-shrink-0">
        45减3 | 65减6 | 100减15
      </span>
    </div>
  </div>
);

export default RestaurantInfoCard;

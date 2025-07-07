
'use client';
import { ChevronLeft, Search, Star, MessageCircle, MoreHorizontal, Plus, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

const RestaurantPage = () => {
  const [activeTab, setActiveTab] = useState('点菜');

  return (
    // Add a container to center content and set a max-width for larger screens
    <div className="max-w-7xl mx-auto">
      <div className="bg-gray-100 min-h-screen pb-24">
        <BannerAndHeader />
        <div className="p-4 relative z-10">
          <RestaurantInfoCard />
        </div>
        <div className="bg-white sticky top-0 z-10 shadow-sm">
          <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
        <div className="p-4">
          {activeTab === '点菜' && <Menu />}
          {activeTab === '超优惠' && <div className="text-center p-8">超优惠 Content</div>}
          {activeTab === '评价' && <div className="text-center p-8">评价 Content</div>}
          {activeTab === '商家' && <div className="text-center p-8">商家 Content</div>}
        </div>
        {/* The footer is fixed, so it's outside the main centered container */}
        <CartFooter />
      </div>
    </div>
  );
};

const BannerAndHeader = () => (
    <div className="relative">
        <Image 
            src="/20250707_185154.jpg" 
            alt="Restaurant Banner" 
            width={500} 
            height={250}
            // Make banner height responsive
            className="w-full h-48 md:h-64 object-cover" 
        />
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-end items-center bg-gradient-to-b from-black/50 to-transparent">
            <div className="flex items-center space-x-2 md:space-x-3">
                <button className="text-white bg-black/30 rounded-full p-1"><Search size={20} /></button>
                <button className="text-white bg-black/30 rounded-full p-1"><MoreHorizontal size={20} /></button>
            </div>
        </div>
    </div>
);


const RestaurantInfoCard = () => (
    <div className="bg-white p-4 rounded-lg shadow-md -mt-16">
        {/* Stack vertically on small screens, horizontally on medium screens and up */}
        <div className="flex flex-col md:flex-row items-start md:items-end">
            <div className="w-24 h-24 bg-gray-300 rounded-lg flex-shrink-0 -mt-8 border-4 border-white">
                {/* Placeholder for logo.png */}
            </div>
            {/* Adjust margin for different screen sizes */}
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
            <p>羊, 质量为本。欢迎您光临小店。本店提供手撕定额发票。 手工制作, 拒...</p>
        </div>
        <div className="mt-4 flex items-center space-x-2 overflow-x-auto pb-2">
            <div className="bg-red-100 border border-red-500 text-red-500 px-2 py-1 rounded-md flex items-center text-sm flex-shrink-0">
                <span className="font-bold text-red-600">神券</span> 
                <span className="font-bold text-lg text-red-600 mx-1">¥18</span>
                <span>满38可用</span>
            </div>
            <div className="bg-red-500 text-white px-3 py-1 rounded-md text-sm flex-shrink-0">¥1 领</div>
            <div className="bg-red-500 text-white px-3 py-1 rounded-md text-sm flex-shrink-0">¥20 领</div>
            <span className="text-red-500 text-sm flex-shrink-0">45减3 | 65减6 | 100减15</span>
        </div>
    </div>
);

const Tabs = ({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (tab: string) => void }) => {
    const tabs = ['点菜', '超优惠', '评价', '商家'];
    const tabCounts: { [key: string]: string } = { '评价': '697' };

    return (
        <div className="flex justify-around border-b items-center h-16">
            {tabs.map(tab => (
                <div key={tab} className="relative text-center py-2 cursor-pointer" onClick={() => setActiveTab(tab)}>
                    <span className={`font-bold text-lg ${activeTab === tab ? 'text-yellow-500' : 'text-gray-500'}`}>{tab}</span>
                    {tabCounts[tab] && <span className={`block text-xs -mt-1 ${activeTab === tab ? 'text-yellow-500' : 'text-gray-500'}`}>{tabCounts[tab]}</span>}
                    {activeTab === tab && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-1 bg-yellow-500 rounded-full"></div>}
                </div>
            ))}
        </div>
    );
};

const Menu = () => {
    const [selectedCategory, setSelectedCategory] = useState('春日暖心❤️限量特');
    const categories = ['春日暖心❤️限量特', '臻选超值随心配', '皮薄馅大🐷鲜肉...', '春日新品', '素食主义🎄韭菜...'];

    const randomDishes = Array.from({ length: 5 }, (_, i) => ({
        name: `随机菜品 ${i + 1}`,
        tags: [`月售${Math.floor(Math.random() * 500)}+`, `好评率${Math.floor(Math.random() * 20) + 80}%`],
        price: (Math.random() * 30 + 10).toFixed(2),
        originalPrice: (Math.random() * 20 + 40).toFixed(2),
        discount: `${(Math.random() * 5 + 3).toFixed(1)}折`,
        image: `https://picsum.photos/seed/${i}/200/300`,
    }));

    return (
        <div className="flex flex-col md:flex-row">
            <div className="w-full md:w-1/4 bg-gray-100 md:space-y-1 p-2 rounded-lg">
                <div className="flex flex-row md:flex-col overflow-x-auto md:overflow-visible space-x-2 md:space-x-0 pb-2 md:pb-0">
                    {categories.map(category => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`p-2 rounded-lg text-center flex-shrink-0 ${selectedCategory === category ? 'bg-white font-bold text-yellow-500' : 'bg-transparent text-gray-600'}`}
                        >
                            <span className="leading-tight">{category}</span>
                        </button>
                    ))}
                    <button className="w-auto md:w-full mt-0 md:mt-4 bg-yellow-300 text-gray-800 py-2 px-4 md:px-0 rounded-full font-bold text-sm flex-shrink-0">精选套餐</button>
                </div>
            </div>
            <div className="w-full md:w-3/4 bg-white p-4 mt-4 md:mt-0 md:ml-2 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-2">
                        <span className="font-bold text-gray-800">猜你喜欢</span>
                    </div>
                    <Image src="/PixPin_2025-07-07_18-56-35.png" alt="avatar" width={24} height={24} className="rounded-full" />
                </div>
                <MenuItem
                    image="/shuijiao_1.jpg"
                    name="韭菜鸡蛋水饺(整份 24 只)"
                    tags={["月售100+", "店内复购第3名 >", "5人觉得味道赞"]}
                    price={29.88}
                    originalPrice={48.88}
                    discount="6.11折"
                    promoPrice={15.38}
                    isSignature={true}
                />
                <div className="mt-6">
                    <h3 className="text-lg font-bold">春日暖心❤️限量特</h3>
                    <MenuItem
                        image="/shuijiao_2.jpg"
                        name="❤️❤️暖心全家福水饺 25只+康师傅冰红茶"
                        tags={["月售400+", "门店销量第1名 >", "店内复购第1名 >"]}
                        price={29.88}
                        originalPrice={58.88}
                        discount="5.07折"
                        isSelectable={true}
                    />
                </div>
                <div className="mt-6">
                    <h3 className="text-lg font-bold">随机推荐</h3>
                    {randomDishes.map((dish, index) => (
                        <MenuItem
                            key={index}
                            image={dish.image}
                            name={dish.name}
                            tags={dish.tags}
                            price={parseFloat(dish.price)}
                            originalPrice={parseFloat(dish.originalPrice)}
                            discount={dish.discount}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

type MenuItemProps = {
  image: string;
  name: string;
  tags: string[];
  price: number;
  originalPrice: number;
  discount: string;
  promoPrice?: number | null;
  isSelectable?: boolean;
  isSignature?: boolean;
};

const MenuItem = ({ 
  image, 
  name, 
  tags, 
  price, 
  originalPrice, 
  discount, 
  promoPrice = null, 
  isSelectable = false, 
  isSignature = false 
}: MenuItemProps) => (
  // On mobile: stack vertically. On small screens and up: side-by-side
  <div className="flex flex-col sm:flex-row items-start mt-8">
    {/* On mobile: full-width image. On small screens and up: fixed width */}
    <div className="relative w-full sm:w-28 h-48 sm:h-28 rounded-lg flex-shrink-0 bg-gray-200">
      <Image src={image} alt={name} layout="fill" objectFit="cover" className="rounded-lg" />
      {isSignature && <span className="absolute top-0 left-0 bg-yellow-400 text-white text-xs font-bold px-2 py-1 rounded-br-lg rounded-tl-lg">招牌</span>}
    </div>
    {/* On mobile: add top margin. On small screens and up: add left margin */}
    <div className="ml-0 sm:ml-4 mt-2 sm:mt-0 flex-grow w-full">
      <h4 className="text-lg font-bold">{name}</h4>
      <div className="flex flex-wrap items-center text-xs text-orange-500 mt-1">
          {tags.map(tag => <span key={tag} className="bg-orange-100 mr-2 mb-1 px-2 py-1 rounded">{tag}</span>)}
      </div>
      <span className="border border-red-500 text-red-500 text-xs px-2 py-0.5 rounded mt-1 inline-block">{discount}</span>
      <div className="flex justify-between items-end mt-2">
        <div>
            <div className="flex items-baseline">
                <span className="text-red-500 text-xl font-bold">¥{price}</span>
                <span className="text-gray-400 line-through ml-2">¥{originalPrice}</span>
            </div>
            {promoPrice && <span className="text-red-500 text-sm">¥{promoPrice} 神券价</span>}
        </div>
        <div className="self-end">
            {isSelectable ? <button className="bg-yellow-400 text-gray-800 px-4 py-1 rounded-full font-bold">选规格</button> : <PlusCircle />}
        </div>
      </div>
    </div>
  </div>
);

const PlusCircle = () => {
    return (
        <div className="bg-yellow-400 text-white rounded-full w-6 h-6 flex items-center justify-center">
            <Plus size={20} />
        </div>
    )
}

const CartFooter = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-white p-2 shadow-[0_-2px_8px_rgba(0,0,0,0.08)] flex justify-between items-center z-20 max-w-7xl mx-auto">
        <div className="flex items-center">
            <div className="bg-yellow-400 p-3 rounded-full relative">
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">2</div>
                <ShoppingCart className="text-black" />
            </div>
            <div className="ml-4">
                <p className="text-xl font-bold text-black">¥59.76</p>
                <p className="text-xs text-gray-500">另需配送费 ¥3</p>
            </div>
        </div>
        <button className="bg-yellow-400 text-black px-8 py-3 rounded-full text-base md:text-lg font-bold">去结算</button>
    </div>
)

export default RestaurantPage;

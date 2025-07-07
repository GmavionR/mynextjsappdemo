
'use client';
import { ChevronLeft, Search, Star, MessageCircle, MoreHorizontal, Plus, ShoppingCart, X, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useState, useMemo } from 'react';

const menuData = {
  "折扣超值": [
    { name: "炸春卷", price: 15.00, originalPrice: 20.00, discount: "7.5折" },
    { name: "盐酥鸡", price: 22.00, originalPrice: 28.00, discount: "7.8折" }
  ],
  "热菜类": [
    { name: "宫保鸡丁", price: 35.00, originalPrice: 45.00, discount: "7.7折" },
    { name: "香辣鸡翅", price: 38.00, originalPrice: 48.00, discount: "7.9折" },
    { name: "羊肉串", price: 25.00, originalPrice: 30.00, discount: "8.3折" },
    { name: "羊排", price: 55.00, originalPrice: 68.00, discount: "8.0折" },
    { name: "清蒸桂鱼", price: 68.00, originalPrice: 88.00, discount: "7.7折" },
    { name: "椒盐龙利鱼", price: 48.00, originalPrice: 60.00, discount: "8.0折" }
  ],
  "素菜类": [
    { name: "炒时蔬", price: 18.00, originalPrice: 22.00, discount: "8.1折" },
    { name: "干锅花菜", price: 28.00, originalPrice: 35.00, discount: "8.0折" },
    { name: "香菇炖豆腐", price: 25.00, originalPrice: 32.00, discount: "7.8折" }
  ],
  "汤类": [
    { name: "排骨汤", price: 28.00, originalPrice: 35.00, discount: "8.0折" },
    { name: "酸辣汤", price: 18.00, originalPrice: 22.00, discount: "8.1折" },
    { name: "鸡茸汤", price: 22.00, originalPrice: 28.00, discount: "7.8折" },
    {
        name: "牛肉粉丝汤",
        price: 32.00,
        originalPrice: 40.00,
        discount: "8.0折",
        isSelectable: true,
        specifications: {
            "规格": [
                { name: "小份", price: 0 },
                { name: "中份", price: 2 },
                { name: "大份", price: 5 }
            ],
            "辣度": [
                { name: "不辣", price: 0 },
                { name: "微辣", price: 0 },
                { name: "中辣", price: 0 },
                { name: "特辣", price: 0 }
            ],
            "温度": [
                { name: "常温", price: 0 },
                { name: "冰镇", price: 0 }
            ],
            "饮料": [
                { name: "可口可乐", price: 0 },
                { name: "雪碧", price: 1 },
                { name: "美年达", price: 3 }
            ]
        }
    }
  ],
  "咸菜小碟": [
    { name: "酸辣白菜", price: 8.00, originalPrice: 10.00, discount: "8.0折" },
    { name: "萝卜丁", price: 6.00, originalPrice: 8.00, discount: "7.5折" },
    { name: "咸菜", price: 5.00, originalPrice: 6.00, discount: "8.3折" }
  ],
  "主食类": [
    { name: "白米饭", price: 3.00, originalPrice: 4.00, discount: "7.5折" },
    { name: "刀削面", price: 15.00, originalPrice: 18.00, discount: "8.3折" },
    { name: "水饺", price: 20.00, originalPrice: 25.00, discount: "8.0折" }
  ],
  "酒水": [
    { name: "青岛啤酒", price: 8.00, originalPrice: 10.00, discount: "8.0折" },
    { name: "燕京啤酒", price: 8.00, originalPrice: 10.00, discount: "8.0折" },
    { name: "五粮液", price: 888.00, originalPrice: 1088.00, discount: "8.1折" },
    { name: "茅台", price: 1288.00, originalPrice: 1588.00, discount: "8.1折" },
    { name: "汾酒", price: 388.00, originalPrice: 488.00, discount: "7.9折" },
    { name: "可乐", price: 5.00, originalPrice: 6.00, discount: "8.3折" },
    { name: "雪碧", price: 5.00, originalPrice: 6.00, discount: "8.3折" }
  ],
    "精选套餐": [
    { name: "单人套餐", price: 48.00, originalPrice: 68.00, discount: "7.0折" },
    { name: "双人套餐", price: 88.00, originalPrice: 128.00, discount: "6.8折" }
  ]
};

const RestaurantPage = () => {
  const [activeTab, setActiveTab] = useState('点菜');
  const [cart, setCart] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addToCart = (item: any) => {
    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(cartItem => cartItem.name === item.name && JSON.stringify(cartItem.options) === JSON.stringify(item.options));
      if (existingItemIndex > -1) {
        const newCart = [...prevCart];
        newCart[existingItemIndex].quantity++;
        return newCart;
      } else {
        return [...prevCart, { ...item, quantity: 1 }];
      }
    });
  };

  const updateQuantity = (name: string, options: any, delta: number) => {
    setCart(prevCart => {
        return prevCart.map(item => {
            if (item.name === name && JSON.stringify(item.options) === JSON.stringify(options)) {
                const newQuantity = item.quantity + delta;
                return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
            }
            return item;
        }).filter(item => item !== null) as any[];
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white min-h-screen pb-24">
        <BannerAndHeader />
        <div className="p-4 relative z-10">
          <RestaurantInfoCard />
        </div>
        <div className="bg-white sticky top-0 z-10 shadow-sm">
          <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
        <div className="p-4">
          {activeTab === '点菜' && <Menu addToCart={addToCart} />}
          {activeTab === '超优惠' && <div className="text-center p-8">超优惠 Content</div>}
          {activeTab === '评价' && <div className="text-center p-8">评价 Content</div>}
          {activeTab === '商家' && <div className="text-center p-8">商家 Content</div>}
        </div>
        <CartFooter cart={cart} toggleCart={() => setIsCartOpen(!isCartOpen)} />
        {isCartOpen && <CartPopup cart={cart} onClose={() => setIsCartOpen(false)} updateQuantity={updateQuantity} clearCart={clearCart} />}
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
        <div className="flex flex-col md:flex-row items-start md:items-end">
            <div className="w-24 h-24 bg-gray-300 rounded-lg flex-shrink-0 -mt-8 border-4 border-white">
            </div>
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

const Menu = ({ addToCart }: { addToCart: (item: any) => void }) => {
    const [selectedCategory, setSelectedCategory] = useState(Object.keys(menuData)[0]);
    const categories = Object.keys(menuData);
    const dishes = menuData[selectedCategory as keyof typeof menuData];
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDish, setSelectedDish] = useState<any>(null);

    const openModal = (dish:any) => {
        setSelectedDish(dish);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedDish(null);
    };

    return (
        <div className="flex flex-col md:flex-row">
            <div className="w-full md:w-1/4 p-2">
                <div className="flex flex-row flex-wrap md:flex-col md:overflow-visible space-x-2 md:space-x-0 pb-2 md:pb-0">
                    {categories.map(category => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`p-3 rounded-lg text-left w-auto md:w-full mb-2 ${selectedCategory === category ? 'bg-gray-100 font-bold text-gray-900' : 'bg-transparent text-gray-600'}`}
                        >
                            <span className="leading-tight">{category}</span>
                        </button>
                    ))}
                </div>
            </div>
            <div className="w-full md:w-3/4 bg-white p-4 md:ml-2 rounded-lg">
                <h3 className="text-lg font-bold mb-4">{selectedCategory}</h3>
                {dishes.map((dish: any, index) => (
                    <MenuItem
                        key={index}
                        image={`https://picsum.photos/seed/${dish.name}/200/300`}
                        name={dish.name}
                        tags={[`月售${Math.floor(Math.random() * 200)}+`, `好评率${Math.floor(Math.random() * 10) + 90}%`]}
                        price={dish.price}
                        originalPrice={dish.originalPrice}
                        discount={dish.discount}
                        isSelectable={dish.isSelectable}
                        onSelect={() => openModal(dish)}
                        addToCart={addToCart}
                    />
                ))}
            </div>
            {isModalOpen && selectedDish && <SpecificationModal dish={selectedDish} onClose={closeModal} addToCart={addToCart} />}
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
  onSelect?: () => void;
  addToCart: (item: any) => void;
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
  isSignature = false,
  onSelect,
  addToCart
}: MenuItemProps) => (
  <div className="flex flex-col sm:flex-row items-start mt-8">
    <div className="relative w-full sm:w-28 h-48 sm:h-28 rounded-lg flex-shrink-0 bg-gray-200">
      <Image src={image} alt={name} layout="fill" objectFit="cover" className="rounded-lg" />
      {isSignature && <span className="absolute top-0 left-0 bg-yellow-400 text-white text-xs font-bold px-2 py-1 rounded-br-lg rounded-tl-lg">招牌</span>}
    </div>
    <div className="ml-0 sm:ml-4 mt-2 sm:mt-0 flex-grow w-full">
      <h4 className="text-lg font-bold">{name}</h4>
      <div className="flex flex-wrap items-center text-xs text-orange-500 mt-1">
          {tags.map(tag => <span key={tag} className="bg-orange-100 mr-2 mb-1 px-2 py-1 rounded">{tag}</span>)}
      </div>
      <span className="border border-red-500 text-red-500 text-xs px-2 py-0.5 rounded mt-1 inline-block">{discount}</span>
      <div className="flex justify-between items-end mt-2">
        <div>
            <div className="flex items-baseline">
                <span className="text-red-500 text-xl font-bold">¥{price.toFixed(2)}</span>
                <span className="text-gray-400 line-through ml-2">¥{originalPrice.toFixed(2)}</span>
            </div>
            {promoPrice && <span className="text-red-500 text-sm">¥{promoPrice.toFixed(2)} 神券价</span>}
        </div>
        <div className="self-end">
            {isSelectable ? <button onClick={onSelect} className="bg-yellow-400 text-gray-800 px-4 py-1 rounded-full font-bold">选规格</button> : <PlusCircle onClick={() => addToCart({ name, price })} />}
        </div>
      </div>
    </div>
  </div>
);

const PlusCircle = ({ onClick }: { onClick: () => void }) => {
    return (
        <button onClick={onClick} className="bg-yellow-400 text-white rounded-full w-6 h-6 flex items-center justify-center">
            <Plus size={20} />
        </button>
    )
};

const SpecificationModal = ({ dish, onClose, addToCart }: { dish: any, onClose: () => void, addToCart: (item: any) => void }) => {
    const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
        const initialOptions: Record<string, string> = {};
        Object.keys(dish.specifications).forEach(specCategory => {
            initialOptions[specCategory] = dish.specifications[specCategory][0].name;
        });
        return initialOptions;
    });

    const totalPrice = useMemo(() => {
        let total = dish.price;
        Object.keys(selectedOptions).forEach(specCategory => {
            const selectedOptionName = selectedOptions[specCategory];
            const option = dish.specifications[specCategory].find((o: any) => o.name === selectedOptionName);
            if (option) {
                total += option.price;
            }
        });
        return total;
    }, [selectedOptions, dish]);

    const handleOptionClick = (specCategory: string, optionName: string) => {
        setSelectedOptions(prev => ({ ...prev, [specCategory]: optionName }));
    };

    const handleAddToCart = () => {
        addToCart({
            name: dish.name,
            price: totalPrice,
            options: selectedOptions,
        });
        onClose();
    };

    const selectedSpecs = Object.values(selectedOptions).join(', ');

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-sm">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold">{dish.name}</h3>
                    <button onClick={onClose} className="text-gray-500"><X size={24} /></button>
                </div>
                <div>
                    {Object.keys(dish.specifications).map(specCategory => (
                        <div key={specCategory} className="mb-4">
                            <h4 className="font-semibold text-sm mb-2">{specCategory}</h4>
                            <div className="flex flex-wrap gap-2">
                                {dish.specifications[specCategory].map((option: any) => (
                                    <button
                                        key={option.name}
                                        onClick={() => handleOptionClick(specCategory, option.name)}
                                        className={`px-3 py-1.5 text-sm rounded-full ${selectedOptions[specCategory] === option.name ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}
                                    >
                                        {option.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                    <div className="flex justify-between items-center mt-6">
                        <div className="flex-1">
                            <p className="text-xs text-gray-600 mb-1">已选规格: {selectedSpecs}</p>
                            <div className="flex items-baseline">
                                <span className="text-red-500 text-lg font-bold">¥{totalPrice.toFixed(2)}</span>
                                <span className="text-gray-400 line-through ml-2 text-sm">¥{dish.originalPrice.toFixed(2)}</span>
                                <span className="bg-red-100 text-red-500 text-xs font-bold px-2 py-1 rounded-md ml-2">{dish.discount}</span>
                            </div>
                        </div>
                        <button onClick={handleAddToCart} className="bg-yellow-400 text-black px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap">加入购物车</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const CartFooter = ({ cart, toggleCart }: { cart: any[], toggleCart: () => void }) => {
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white p-2 shadow-[0_-2px_8px_rgba(0,0,0,0.08)] flex justify-between items-center z-20 max-w-7xl mx-auto">
            <div className="flex items-center">
                <button onClick={toggleCart} className="bg-yellow-400 p-3 rounded-full relative">
                    {totalItems > 0 && <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">{totalItems}</div>}
                    <ShoppingCart className="text-black" />
                </button>
                <div className="ml-4">
                    <p className="text-xl font-bold text-black">¥{totalPrice.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">另需配送费 ¥3</p>
                </div>
            </div>
            <button className="bg-yellow-400 text-black px-8 py-3 rounded-full text-base md:text-lg font-bold">去结算</button>
        </div>
    );
};

const CartPopup = ({ cart, onClose, updateQuantity, clearCart }: { cart: any[], onClose: () => void, updateQuantity: (name: string, options: any, delta: number) => void, clearCart: () => void }) => {
    return (
        <div className="fixed inset-0 z-40 flex items-end bg-gray-200 bg-opacity-30" onClick={onClose}>
            <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-lg shadow-lg max-h-[50vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="font-bold text-lg">已选购商品</h3>
                    <button onClick={clearCart} className="text-sm text-gray-500 flex items-center"><Trash2 className="w-4 h-4 mr-1" />清空</button>
                </div>
                <div className="overflow-y-auto p-4 flex-grow">
                    {cart.map((item, index) => (
                        <div key={index} className="flex justify-between items-center mb-4">
                            <div className='flex items-center'>
                                <Image src={`https://picsum.photos/seed/${item.name}/200/300`} alt={item.name} width={48} height={48} className="rounded-md mr-4" />
                                <div>
                                    <p className="font-semibold">{item.name}</p>
                                    {item.options && <p className="text-xs text-gray-500">{Object.values(item.options).join(', ')}</p>}
                                </div>
                            </div>
                            <div className="flex items-center">
                                <span className="font-semibold mr-4">¥{(item.price * item.quantity).toFixed(2)}</span>
                                <div className="flex items-center">
                                    <button onClick={() => updateQuantity(item.name, item.options, -1)} className="bg-gray-200 rounded-full w-6 h-6 flex items-center justify-center">-</button>
                                    <span className="mx-2">{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.name, item.options, 1)} className="bg-yellow-400 text-white rounded-full w-6 h-6 flex items-center justify-center">+</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default RestaurantPage;

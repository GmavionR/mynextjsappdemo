import Image from 'next/image';
import { Plus } from 'lucide-react';
import { DishItemProps } from '../types';

export default function DishItem({ 
    image, 
    name, 
    tags = [], 
    price, 
    originalPrice, 
    discount, 
    promoPrice = null, 
    isSelectable = false, 
    isSignature = false,
    onSelect,
    addToCart
}: DishItemProps) {

    const handleAddToCart = () => {
        addToCart({
            name,
            price,
            quantity: 1,
            options: {}
        });
    };

    return (
        <div className="flex flex-col sm:flex-row items-start mt-8">
            <div className="relative w-full sm:w-28 h-48 sm:h-28 rounded-lg flex-shrink-0 bg-gray-200">
                <Image src={image} alt={name} layout="fill" objectFit="cover" className="rounded-lg" />
                {isSignature && (
                    <span className="absolute top-0 left-0 bg-yellow-400 text-white text-xs font-bold px-2 py-1 rounded-br-lg rounded-tl-lg">
                        招牌
                    </span>
                )}
            </div>
            <div className="ml-0 sm:ml-4 mt-2 sm:mt-0 flex-grow w-full">
                <h4 className="text-lg font-bold">{name}</h4>
                <div className="flex flex-wrap items-center text-xs text-orange-500 mt-1">
                    {tags.map((tag, index) => (
                        <span 
                            key={index} 
                            className={`mr-2 mb-1 px-2 py-1 rounded ${
                                tag.category === 'REPEAT_CUSTOMER' || tag.category === 'SALES_RANK' 
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : 'bg-orange-100'
                            }`}
                        >
                            {tag.text}
                        </span>
                    ))}
                </div>
                <span className="border border-red-500 text-red-500 text-xs px-2 py-0.5 rounded mt-1 inline-block">
                    {discount}
                </span>
                <div className="flex justify-between items-end mt-2">
                    <div>
                        <div className="flex items-baseline">
                            <span className="text-red-500 text-xl font-bold">¥{price.toFixed(2)}</span>
                            <span className="text-gray-400 line-through ml-2">¥{originalPrice.toFixed(2)}</span>
                        </div>
                        {promoPrice && (
                            <span className="text-red-500 text-sm">¥{promoPrice.toFixed(2)} 神券价</span>
                        )}
                    </div>
                    <div className="self-end">
                        {isSelectable ? (
                            <button 
                                onClick={onSelect} 
                                className="bg-yellow-400 text-gray-800 px-4 py-1 rounded-full font-bold"
                            >
                                选规格
                            </button>
                        ) : (
                            <button 
                                onClick={handleAddToCart} 
                                className="bg-yellow-400 text-white rounded-full w-6 h-6 flex items-center justify-center"
                            >
                                <Plus size={20} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
} 
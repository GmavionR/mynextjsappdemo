import { useState, useMemo } from 'react';
import { X } from 'lucide-react';
import { SpecificationModalProps } from '../types';

export default function SpecificationModal({ dish, onClose, addToCart }: SpecificationModalProps) {
    const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
        const initialOptions: Record<string, string> = {};
        if (dish.specifications) {
            Object.keys(dish.specifications).forEach(specCategory => {
                const options = dish.specifications![specCategory];
                const defaultOption = options.find(o => o.isDefault) || options[0];
                initialOptions[specCategory] = defaultOption.name;
            });
        }
        return initialOptions;
    });

    const totalPrice = useMemo(() => {
        let total = dish.price;
        if (dish.specifications) {
            Object.keys(selectedOptions).forEach(specCategory => {
                const selectedOptionName = selectedOptions[specCategory];
                const option = dish.specifications![specCategory].find(o => o.name === selectedOptionName);
                if (option) {
                    total += option.price;
                }
            });
        }
        return total;
    }, [selectedOptions, dish]);

    const handleOptionClick = (specCategory: string, optionName: string) => {
        setSelectedOptions(prev => ({ ...prev, [specCategory]: optionName }));
    };

    const handleAddToCart = () => {
        addToCart({
            name: dish.name,
            price: totalPrice,
            quantity: 1,
            category: dish.category,
            image: dish.image,
            options: selectedOptions
        });
        onClose();
    };

    const selectedSpecs = Object.values(selectedOptions).join(', ');

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-sm">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold">{dish.name}</h3>
                    <button onClick={onClose} className="text-gray-500"><X size={24} /></button>
                </div>
                <div>
                    {dish.specifications && Object.keys(dish.specifications).map(specCategory => (
                        <div key={specCategory} className="mb-4">
                            <h4 className="font-semibold text-sm mb-2">{specCategory}</h4>
                            <div className="flex flex-wrap gap-2">
                                {dish.specifications![specCategory].map((option) => (
                                    <button
                                        key={option.name}
                                        onClick={() => handleOptionClick(specCategory, option.name)}
                                        className={`px-3 py-1.5 text-sm rounded-full ${
                                            selectedOptions[specCategory] === option.name 
                                                ? 'bg-yellow-100 text-yellow-800' 
                                                : 'bg-gray-100 text-gray-800'
                                        }`}
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
                        <button 
                            onClick={handleAddToCart} 
                            className="bg-yellow-400 text-black px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap"
                        >
                            加入购物车
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
} 
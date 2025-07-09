"use client";
import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { type Dish } from "../types/index";
import { CartItem } from "../types";
import DishItem from "./DishItem";
import SpecificationModal from "./SpecificationModal";
import {
  DISH_CATEGORIES,
  getCategoryNameById,
  type DishCategoryId,
} from "../types/constants";

interface MenuProps {
  addToCart: (item: CartItem) => void;
  dishes: Record<DishCategoryId, Dish[]>;
  dishesLoading: boolean;
  dishesError: string | null;
  findDishById: (dishId: string) => Dish | null;
}

const Menu = ({ 
  addToCart, 
  dishes,
  dishesLoading,
  dishesError,
  findDishById 
}: MenuProps) => {
  const [selectedCategory, setSelectedCategory] = useState<DishCategoryId>(
    DISH_CATEGORIES.DISCOUNT.id
  );
  const categories = Object.values(DISH_CATEGORIES);
  const categoryDishes = dishes[selectedCategory] || [];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);

  const handleAddToCart = (dish: Dish) => {
    addToCart({
      id: dish.id,
      name: dish.name,
      price: dish.price,
      quantity: 1,
      options: {},
      category: dish.category,
      image: dish.image,
    });
  };

  const openModal = (dish: Dish) => {
    setSelectedDish(dish);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDish(null);
  };

  // 加载状态
  if (dishesLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">加载菜品数据中...</div>
      </div>
    );
  }

  // 错误状态
  if (dishesError) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="text-red-500 text-lg mb-4">错误: {dishesError}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          重试
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row">
      <div className="w-full md:w-1/4">
        <div className="flex flex-row flex-wrap md:flex-col md:overflow-visible space-x-2 md:space-x-0">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`py-2 px-3 rounded-lg text-left w-auto md:w-full ${
                selectedCategory === category.id
                  ? "bg-gray-100 font-bold text-gray-900"
                  : "bg-transparent text-gray-600"
              }`}
            >
              <span className="leading-tight">{category.name}</span>
            </button>
          ))}
        </div>
        <div className="bg-yellow-50 mt-2 overflow-hidden">
          <div className="flex items-center justify-center py-1.5 px-2 relative w-full">
            <div className="flex items-center gap-1 animate-scroll-x w-full justify-center">
              <AlertCircle
                size={14}
                className="text-yellow-600 flex-shrink-0"
              />
              <span className="text-yellow-700 text-xs whitespace-nowrap">
                如需其他菜品可告知老板,支持带菜加工.
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full md:w-3/4 bg-white p-4 md:ml-2 rounded-lg">
        <h3 className="text-lg font-bold mb-4">
          {getCategoryNameById(selectedCategory)}
        </h3>
        {categoryDishes.map((dish: Dish) => (
          <DishItem
            key={dish.id}
            id={dish.id}
            category={dish.category}
            image={`https://picsum.photos/seed/${dish.name}/200/300`}
            name={dish.name}
            tags={dish.tags}
            price={dish.price}
            originalPrice={dish.originalPrice}
            discount={dish.discount}
            isSelectable={dish.isSelectable}
            onSelect={() => openModal(dish)}
            addToCart={() => handleAddToCart(dish)}
          />
        ))}
      </div>
      {isModalOpen && selectedDish && (
        <SpecificationModal
          dish={selectedDish}
          onClose={closeModal}
          addToCart={addToCart}
        />
      )}
    </div>
  );
};

export default Menu;

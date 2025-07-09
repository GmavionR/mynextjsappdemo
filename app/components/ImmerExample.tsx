/**
 * 展示 Immer 集成后的状态管理使用示例
 */
'use client';

import { useClientDishesState } from '../stores/clientSafeDishesStore';
import { useCartStore } from '../stores/cart';
import { DISH_CATEGORIES } from '../types/constants';

export default function ImmerExample() {
  const {
    dishes,
    loading,
    error,
    fetchDishes,
    addDishToCategory,
    updateDish,
    removeDishFromCategory,
  } = useClientDishesState();

  const {
    items: cartItems,
    addToCart,
    updateQuantity,
    getTotalItems,
    getTotalPrice,
    clearCart,
  } = useCartStore();

  const handleAddTestDish = () => {
    const testDish = {
      id: `test-${Date.now()}`,
      name: '测试菜品',
      price: 29.9,
      originalPrice: 39.9,
      category: DISH_CATEGORIES.HOT_DISHES.id,
      tags: [{ 
        text: '新品', 
        category: 'SALES_RANK' as const,
        name: '新品',
        color: 'red' 
      }],
      discount: '限时特价',
      image: 'https://picsum.photos/200/300',
      description: '这是一个测试菜品',
      isSelectable: false,
      specifications: {},
      monthSales: 100,
      rating: 4.5,
    };

    // 使用 Immer 添加菜品 - 语法非常简洁！
    addDishToCategory(DISH_CATEGORIES.HOT_DISHES.id, testDish);
  };

  const handleUpdateDishPrice = (dishId: string) => {
    // 使用 Immer 更新菜品价格 - 直接修改嵌套属性
    updateDish(dishId, { price: Math.random() * 50 + 10 });
  };

  const handleAddToCart = (dish: any) => {
    // 使用 Immer 添加到购物车 - 自动处理重复商品
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

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Immer 状态管理示例</h1>
      
      {/* 菜品管理示例 */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">菜品管理</h2>
        <div className="flex gap-4 mb-4">
          <button
            onClick={fetchDishes}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? '加载中...' : '获取菜品数据'}
          </button>
          <button
            onClick={handleAddTestDish}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            添加测试菜品
          </button>
        </div>
        
        {error && (
          <div className="text-red-500 mb-4">错误: {error}</div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(dishes).map(([category, dishList]) =>
            dishList.slice(0, 2).map((dish) => (
              <div key={dish.id} className="border rounded-lg p-4">
                <h3 className="font-semibold">{dish.name}</h3>
                <p className="text-gray-600">¥{dish.price.toFixed(2)}</p>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleUpdateDishPrice(dish.id)}
                    className="px-2 py-1 text-xs bg-yellow-500 text-white rounded"
                  >
                    随机价格
                  </button>
                  <button
                    onClick={() => handleAddToCart(dish)}
                    className="px-2 py-1 text-xs bg-blue-500 text-white rounded"
                  >
                    加入购物车
                  </button>
                  <button
                    onClick={() => removeDishFromCategory(dish.category as any, dish.id)}
                    className="px-2 py-1 text-xs bg-red-500 text-white rounded"
                  >
                    删除
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 购物车管理示例 */}
      <div>
        <h2 className="text-xl font-semibold mb-4">
          购物车管理 ({getTotalItems()} 件商品，总价 ¥{getTotalPrice().toFixed(2)})
        </h2>
        <button
          onClick={clearCart}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 mb-4"
        >
          清空购物车
        </button>
        
        <div className="space-y-2">
          {cartItems.map((item, index) => (
            <div key={index} className="flex items-center justify-between border rounded p-3">
              <div>
                <span className="font-semibold">{item.name}</span>
                <span className="text-gray-500 ml-2">¥{item.price.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item.id, item.options || {}, -1)}
                  className="px-2 py-1 bg-gray-300 rounded"
                >
                  -
                </button>
                <span>{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.options || {}, 1)}
                  className="px-2 py-1 bg-gray-300 rounded"
                >
                  +
                </button>
              </div>
            </div>
          ))}
          {cartItems.length === 0 && (
            <p className="text-gray-500 text-center py-4">购物车为空</p>
          )}
        </div>
      </div>
      
      <div className="mt-8 p-4 bg-green-100 rounded-lg">
        <h3 className="font-semibold text-green-800 mb-2">Immer 的优势展示：</h3>
        <ul className="text-sm text-green-700 space-y-1">
          <li>✅ 添加菜品：直接 <code>draft.dishes[category].push(dish)</code></li>
          <li>✅ 更新价格：直接 <code>draft.dishes[category][index].price = newPrice</code></li>
          <li>✅ 购物车数量：直接 <code>draft.items[index].quantity += delta</code></li>
          <li>✅ 自动处理不可变性，无需手动展开运算符</li>
          <li>✅ 代码更简洁、直观，减少嵌套状态更新的复杂性</li>
        </ul>
      </div>
    </div>
  );
}

/**
 * 菜品分类常量定义
 * 注意: 禁止新增或删除分类
 */
export const DISH_CATEGORIES = {
  DISCOUNT: {
    id: 'discount',
    name: '折扣超值',
  },
  HOT_DISHES: {
    id: 'hot_dishes',
    name: '热菜类',
  },
  VEGETABLE_DISHES: {
    id: 'vegetable_dishes',
    name: '素菜类',
  },
  SOUPS: {
    id: 'soups',
    name: '汤类',
  },
  STAPLE_FOOD: {
    id: 'staple_food',
    name: '主食类',
  },
  DRINKS: {
    id: 'drinks',
    name: '酒水',
  },
} as const;

// 导出类型
export type DishCategoryKey = keyof typeof DISH_CATEGORIES;
export type DishCategoryId = typeof DISH_CATEGORIES[DishCategoryKey]['id'];
export type DishCategory = typeof DISH_CATEGORIES[DishCategoryKey];

// 获取所有分类ID的数组
export const DISH_CATEGORY_IDS = Object.values(DISH_CATEGORIES).map(cat => cat.id);

// 获取所有分类名称的数组
export const DISH_CATEGORY_NAMES = Object.values(DISH_CATEGORIES).map(category => category.name);

// 根据分类ID获取分类名称
export function getCategoryNameById(categoryId: DishCategoryId): string {
  const category = Object.values(DISH_CATEGORIES).find(cat => cat.id === categoryId);
  if (!category) {
    throw new Error(`Invalid category ID: ${categoryId}`);
  }
  return category.name;
}

// 根据分类名称获取分类ID
export function getCategoryIdByName(categoryName: string): DishCategoryId | undefined {
  const category = Object.values(DISH_CATEGORIES).find(cat => cat.name === categoryName);
  return category?.id;
} 
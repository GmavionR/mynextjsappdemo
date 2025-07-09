import { NextRequest, NextResponse } from 'next/server';
import { DISH_CATEGORIES, type DishCategoryId } from "../..//types/constants";
import {
  type Dish,
  type Specifications,
  type SpecificationOption,
  type Tag,
  type TagCategory,
} from "../../types/index";

// GET /api/dishes - 获取所有菜品数据
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') as DishCategoryId;
    
    // 如果指定了分类，只返回该分类的菜品
    if (category && dishesData[category]) {
      return NextResponse.json({
        success: true,
        data: {
          [category]: dishesData[category]
        },
        message: `成功获取 ${category} 分类的菜品数据`
      });
    }
    
    // 返回所有菜品数据
    return NextResponse.json({
      success: true,
      data: dishesData,
      message: '成功获取所有菜品数据'
    });
  } catch (error) {
    console.error('获取菜品数据失败:', error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        message: '服务器内部错误'
      },
      { status: 500 }
    );
  }
}



// 预定义标签池
const tagPool = {
  REPEAT_CUSTOMER: [
    "20+回头客推荐",
    "10+回头客推荐",
    "店内复购第1名",
    "店内复购第2名",
  ],
  SALES_RANK: ["门店销量第1名", "门店销量第3名"],
  PORTION_FEEDBACK: [
    "分量充足",
    "分量十足",
    "量真的多",
    "4人觉得分量足",
    "6人觉得分量足",
    "7人觉得分量足",
  ],
  TASTE_FEEDBACK: [
    "3人觉得味道赞",
    "5人觉得味道赞",
    "16人觉得味道赞",
    "油酥饼味道好",
  ],
};

// 随机获取标签的辅助函数
function getRandomTags(): Tag[] {
  const tags: Tag[] = [];

  // 随机决定是否添加回头客/复购类标签 (30%概率)
  if (Math.random() < 0.3) {
    const text =
      tagPool.REPEAT_CUSTOMER[
        Math.floor(Math.random() * tagPool.REPEAT_CUSTOMER.length)
      ];
    tags.push({ text, category: "REPEAT_CUSTOMER" });
  }

  // 随机决定是否添加销量排名标签 (20%概率)
  if (Math.random() < 0.2) {
    const text =
      tagPool.SALES_RANK[Math.floor(Math.random() * tagPool.SALES_RANK.length)];
    tags.push({ text, category: "SALES_RANK" });
  }

  // 随机决定是否添加分量反馈标签 (40%概率)
  if (Math.random() < 0.4) {
    const text =
      tagPool.PORTION_FEEDBACK[
        Math.floor(Math.random() * tagPool.PORTION_FEEDBACK.length)
      ];
    tags.push({ text, category: "PORTION_FEEDBACK" });
  }

  // 随机决定是否添加味道反馈标签 (40%概率)
  if (Math.random() < 0.4) {
    const text =
      tagPool.TASTE_FEEDBACK[
        Math.floor(Math.random() * tagPool.TASTE_FEEDBACK.length)
      ];
    tags.push({ text, category: "TASTE_FEEDBACK" });
  }

  return tags;
}

// 按分类组织的菜品数据
export const dishesData: Record<DishCategoryId, Dish[]> = {
  [DISH_CATEGORIES.DISCOUNT.id]: [
    {
      id: "1",
      name: "炸春卷",
      category: DISH_CATEGORIES.DISCOUNT.id,
      image: "https://picsum.photos/seed/炸春卷/200/300",
      price: 15.0,
      originalPrice: 20.0,
      discount: "7.5折",
      monthSales: 150,
      rating: 95,
      isSignature: true,
      tags: getRandomTags(),
    },
    {
      id: "2",
      name: "盐酥鸡",
      category: DISH_CATEGORIES.DISCOUNT.id,
      image: "https://picsum.photos/seed/盐酥鸡/200/300",
      price: 22.0,
      originalPrice: 28.0,
      discount: "7.8折",
      monthSales: 200,
      rating: 94,
      tags: getRandomTags(),
    },
    {
      id: "10",
      name: "麻婆豆腐",
      category: DISH_CATEGORIES.DISCOUNT.id,
      image: "https://picsum.photos/seed/麻婆豆腐/200/300",
      price: 18.0,
      originalPrice: 25.0,
      discount: "7.2折",
      monthSales: 180,
      rating: 93,
      tags: getRandomTags(),
    },
    {
      id: "11",
      name: "酸菜鱼",
      category: DISH_CATEGORIES.DISCOUNT.id,
      image: "https://picsum.photos/seed/酸菜鱼/200/300",
      price: 42.0,
      originalPrice: 58.0,
      discount: "7.2折",
      monthSales: 220,
      rating: 96,
      isSignature: true,
      tags: getRandomTags(),
    },
  ],
  [DISH_CATEGORIES.HOT_DISHES.id]: [
    {
      id: "3",
      name: "宫保鸡丁",
      category: DISH_CATEGORIES.HOT_DISHES.id,
      image: "https://picsum.photos/seed/宫保鸡丁/200/300",
      price: 35.0,
      originalPrice: 45.0,
      discount: "7.7折",
      monthSales: 300,
      rating: 96,
      isSignature: true,
      tags: getRandomTags(),
    },
    {
      id: "12",
      name: "红烧肉",
      category: DISH_CATEGORIES.HOT_DISHES.id,
      image: "https://picsum.photos/seed/红烧肉/200/300",
      price: 48.0,
      originalPrice: 58.0,
      discount: "8.2折",
      monthSales: 280,
      rating: 97,
      isSignature: true,
      tags: getRandomTags(),
    },
    {
      id: "13",
      name: "鱼香肉丝",
      category: DISH_CATEGORIES.HOT_DISHES.id,
      image: "https://picsum.photos/seed/鱼香肉丝/200/300",
      price: 32.0,
      originalPrice: 38.0,
      discount: "8.4折",
      monthSales: 260,
      rating: 95,
      tags: getRandomTags(),
    },
    {
      id: "14",
      name: "干锅牛肉",
      category: DISH_CATEGORIES.HOT_DISHES.id,
      image: "https://picsum.photos/seed/干锅牛肉/200/300",
      price: 58.0,
      originalPrice: 68.0,
      discount: "8.5折",
      monthSales: 180,
      rating: 94,
      tags: getRandomTags(),
    },
  ],
  [DISH_CATEGORIES.VEGETABLE_DISHES.id]: [
    {
      id: "5",
      name: "炒时蔬",
      category: DISH_CATEGORIES.VEGETABLE_DISHES.id,
      image: "https://picsum.photos/seed/炒时蔬/200/300",
      price: 18.0,
      originalPrice: 22.0,
      discount: "8.1折",
      monthSales: 180,
      rating: 93,
      tags: getRandomTags(),
    },
    {
      id: "15",
      name: "干煸四季豆",
      category: DISH_CATEGORIES.VEGETABLE_DISHES.id,
      image: "https://picsum.photos/seed/干煸四季豆/200/300",
      price: 22.0,
      originalPrice: 26.0,
      discount: "8.4折",
      monthSales: 160,
      rating: 94,
      tags: getRandomTags(),
    },
    {
      id: "16",
      name: "蒜蓉空心菜",
      category: DISH_CATEGORIES.VEGETABLE_DISHES.id,
      image: "https://picsum.photos/seed/蒜蓉空心菜/200/300",
      price: 20.0,
      originalPrice: 24.0,
      discount: "8.3折",
      monthSales: 150,
      rating: 92,
      tags: getRandomTags(),
    },
  ],
  [DISH_CATEGORIES.SOUPS.id]: [
    {
      id: "7",
      name: "牛肉粉丝汤",
      category: DISH_CATEGORIES.SOUPS.id,
      image: "https://picsum.photos/seed/牛肉粉丝汤/200/300",
      price: 32.0,
      originalPrice: 40.0,
      discount: "8.0折",
      monthSales: 220,
      rating: 94,
      isSelectable: true,
      tags: getRandomTags(),
      specifications: {
        规格: [
          { name: "小份", price: 0, isDefault: true },
          { name: "中份", price: 2 },
          { name: "大份", price: 5 },
        ],
        辣度: [
          { name: "不辣", price: 0, isDefault: true },
          { name: "微辣", price: 0 },
          { name: "中辣", price: 0 },
          { name: "特辣", price: 0 },
        ],
        温度: [
          { name: "常温", price: 0, isDefault: true },
          { name: "冰镇", price: 0 },
        ],
        饮料: [
          { name: "可口可乐", price: 0, isDefault: true },
          { name: "雪碧", price: 1 },
          { name: "美年达", price: 3 },
        ],
      },
    },
    {
      id: "17",
      name: "酸辣汤",
      category: DISH_CATEGORIES.SOUPS.id,
      image: "https://picsum.photos/seed/酸辣汤/200/300",
      price: 28.0,
      originalPrice: 35.0,
      discount: "8.0折",
      monthSales: 180,
      rating: 93,
      isSelectable: true,
      tags: getRandomTags(),
      specifications: {
        规格: [
          { name: "小份", price: 0, isDefault: true },
          { name: "中份", price: 2 },
          { name: "大份", price: 5 },
        ],
        辣度: [
          { name: "不辣", price: 0, isDefault: true },
          { name: "微辣", price: 0 },
          { name: "中辣", price: 0 },
        ],
      },
    },
    {
      id: "18",
      name: "番茄蛋汤",
      category: DISH_CATEGORIES.SOUPS.id,
      image: "https://picsum.photos/seed/番茄蛋汤/200/300",
      price: 22.0,
      originalPrice: 28.0,
      discount: "7.8折",
      monthSales: 160,
      rating: 92,
      isSelectable: true,
      tags: getRandomTags(),
      specifications: {
        规格: [
          { name: "小份", price: 0, isDefault: true },
          { name: "中份", price: 2 },
          { name: "大份", price: 5 },
        ],
      },
    },
  ],
  [DISH_CATEGORIES.STAPLE_FOOD.id]: [
    {
      id: "8",
      name: "水饺",
      category: DISH_CATEGORIES.STAPLE_FOOD.id,
      image: "https://picsum.photos/seed/水饺/200/300",
      price: 20.0,
      originalPrice: 25.0,
      discount: "8.0折",
      monthSales: 400,
      rating: 97,
      isSignature: true,
      isSelectable: true,
      tags: getRandomTags(),
      specifications: {
        规格: [
          { name: "小份(12个)", price: 0, isDefault: true },
          { name: "中份(15个)", price: 5 },
          { name: "大份(20个)", price: 10 },
        ],
        口味: [
          { name: "猪肉韭菜", price: 0, isDefault: true },
          { name: "三鲜", price: 2 },
          { name: "牛肉", price: 3 },
        ],
      },
    },
    {
      id: "19",
      name: "炒面",
      category: DISH_CATEGORIES.STAPLE_FOOD.id,
      image: "https://picsum.photos/seed/炒面/200/300",
      price: 25.0,
      originalPrice: 30.0,
      discount: "8.3折",
      monthSales: 280,
      rating: 94,
      isSelectable: true,
      tags: getRandomTags(),
      specifications: {
        规格: [
          { name: "小份", price: 0, isDefault: true },
          { name: "大份", price: 5 },
        ],
        辣度: [
          { name: "不辣", price: 0, isDefault: true },
          { name: "微辣", price: 0 },
          { name: "中辣", price: 0 },
        ],
      },
    },
    {
      id: "20",
      name: "扬州炒饭",
      category: DISH_CATEGORIES.STAPLE_FOOD.id,
      image: "https://picsum.photos/seed/扬州炒饭/200/300",
      price: 28.0,
      originalPrice: 35.0,
      discount: "8.0折",
      monthSales: 320,
      rating: 95,
      isSelectable: true,
      tags: getRandomTags(),
      specifications: {
        规格: [
          { name: "小份", price: 0, isDefault: true },
          { name: "大份", price: 6 },
        ],
      },
    },
  ],
  [DISH_CATEGORIES.DRINKS.id]: [
    {
      id: "9",
      name: "茅台",
      category: DISH_CATEGORIES.DRINKS.id,
      image: "https://picsum.photos/seed/茅台/200/300",
      price: 1288.0,
      originalPrice: 1588.0,
      discount: "8.1折",
      monthSales: 50,
      rating: 98,
      isSignature: true,
      tags: getRandomTags(),
    },
    {
      id: "21",
      name: "青岛啤酒",
      category: DISH_CATEGORIES.DRINKS.id,
      image: "https://picsum.photos/seed/青岛啤酒/200/300",
      price: 8.0,
      originalPrice: 10.0,
      discount: "8.0折",
      monthSales: 500,
      rating: 93,
      tags: getRandomTags(),
    },
    {
      id: "22",
      name: "可乐",
      category: DISH_CATEGORIES.DRINKS.id,
      image: "https://picsum.photos/seed/可乐/200/300",
      price: 5.0,
      originalPrice: 6.0,
      discount: "8.3折",
      monthSales: 800,
      rating: 92,
      tags: getRandomTags(),
    },
    {
      id: "23",
      name: "雪碧",
      category: DISH_CATEGORIES.DRINKS.id,
      image: "https://picsum.photos/seed/雪碧/200/300",
      price: 5.0,
      originalPrice: 6.0,
      discount: "8.3折",
      monthSales: 600,
      rating: 91,
      tags: getRandomTags(),
    },
  ],
};

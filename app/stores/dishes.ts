import { type Tag, type TagCategory } from '../types/index';

// 预定义标签池
const tagPool = {
  REPEAT_CUSTOMER: [
    "20+回头客推荐",
    "10+回头客推荐",
    "店内复购第1名",
    "店内复购第2名"
  ],
  SALES_RANK: [
    "门店销量第1名",
    "门店销量第3名"
  ],
  PORTION_FEEDBACK: [
    "分量充足",
    "分量十足",
    "量真的多",
    "4人觉得分量足",
    "6人觉得分量足",
    "7人觉得分量足"
  ],
  TASTE_FEEDBACK: [
    "3人觉得味道赞",
    "5人觉得味道赞",
    "16人觉得味道赞",
    "油酥饼味道好"
  ]
};

// 随机获取标签的辅助函数
export function getRandomTags(): Tag[] {
  const tags: Tag[] = [];
  
  // 随机决定是否添加回头客/复购类标签 (30%概率)
  if (Math.random() < 0.3) {
    const text = tagPool.REPEAT_CUSTOMER[Math.floor(Math.random() * tagPool.REPEAT_CUSTOMER.length)];
    tags.push({ text, category: "REPEAT_CUSTOMER" });
  }
  
  // 随机决定是否添加销量排名标签 (20%概率)
  if (Math.random() < 0.2) {
    const text = tagPool.SALES_RANK[Math.floor(Math.random() * tagPool.SALES_RANK.length)];
    tags.push({ text, category: "SALES_RANK" });
  }
  
  // 随机决定是否添加分量反馈标签 (40%概率)
  if (Math.random() < 0.4) {
    const text = tagPool.PORTION_FEEDBACK[Math.floor(Math.random() * tagPool.PORTION_FEEDBACK.length)];
    tags.push({ text, category: "PORTION_FEEDBACK" });
  }
  
  // 随机决定是否添加味道反馈标签 (40%概率)
  if (Math.random() < 0.4) {
    const text = tagPool.TASTE_FEEDBACK[Math.floor(Math.random() * tagPool.TASTE_FEEDBACK.length)];
    tags.push({ text, category: "TASTE_FEEDBACK" });
  }
  
  return tags;
}
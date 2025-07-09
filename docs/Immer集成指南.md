# Immer 集成指南

我们已经将 Immer 集成到项目的状态管理中，以简化不可变状态更新。

## 为什么使用 Immer？

### 传统方式的问题
```typescript
// 传统的不可变更新方式 - 复杂且容易出错
const updateGlobalState = (updates: Partial<ClientDishesState>) => {
  if (globalStateRef) {
    globalStateRef.current = { 
      ...globalStateRef.current, 
      dishes: {
        ...globalStateRef.current.dishes,
        ...updates.dishes
      },
      ...updates 
    };
  }
};
```

### 使用 Immer 的优势
```typescript
// 使用 Immer - 简洁且直观
const updateGlobalState = (updater: (draft: ClientDishesState) => void) => {
  if (globalStateRef) {
    globalStateRef.current = produce(globalStateRef.current, updater);
    notifySubscribers();
  }
};
```

## 具体应用示例

### 1. 菜品数据加载
```typescript
// 开始加载
updateGlobalState(draft => {
  draft.loading = true;
  draft.error = null;
});

// 加载成功
updateGlobalState(draft => {
  draft.dishes = result.data;
  draft.loading = false;
  draft.isInitialized = true;
});
```

### 2. 购物车操作
```typescript
// 添加商品到购物车
addToCart: (item) =>
  set(
    produce((draft) => {
      const existingItemIndex = draft.items.findIndex(
        (i: CartItem) => 
          i.id === item.id && 
          JSON.stringify(i.options) === JSON.stringify(item.options)
      );
      
      if (existingItemIndex !== -1) {
        draft.items[existingItemIndex].quantity += item.quantity || 1;
      } else {
        draft.items.push({ ...item, quantity: item.quantity || 1 });
      }
    })
  ),
```

### 3. 嵌套状态更新
```typescript
// 更新菜品信息
const updateDish = useCallback((dishId: string, updates: Partial<Dish>) => {
  updateGlobalState(draft => {
    Object.keys(draft.dishes).forEach(category => {
      const categoryKey = category as DishCategoryId;
      const dishIndex = draft.dishes[categoryKey].findIndex(dish => dish.id === dishId);
      if (dishIndex !== -1) {
        Object.assign(draft.dishes[categoryKey][dishIndex], updates);
      }
    });
  });
}, []);
```

## 新增的便利功能

得益于 Immer，我们添加了一些新的便利操作：

### 菜品管理
```typescript
// 添加菜品到分类
const addDishToCategory = useCallback((category: DishCategoryId, dish: Dish) => {
  updateGlobalState(draft => {
    if (!draft.dishes[category]) {
      draft.dishes[category] = [];
    }
    draft.dishes[category].push(dish);
  });
}, []);

// 从分类中删除菜品
const removeDishFromCategory = useCallback((category: DishCategoryId, dishId: string) => {
  updateGlobalState(draft => {
    if (draft.dishes[category]) {
      draft.dishes[category] = draft.dishes[category].filter(dish => dish.id !== dishId);
    }
  });
}, []);
```

### 购物车高级操作
```typescript
// 更新商品数量（支持增减）
const updateQuantity = (itemId, options, delta) =>
  set(
    produce((draft) => {
      const itemIndex = draft.items.findIndex(/*...*/);
      if (itemIndex !== -1) {
        const newQuantity = draft.items[itemIndex].quantity + delta;
        if (newQuantity > 0) {
          draft.items[itemIndex].quantity = newQuantity;
        } else {
          draft.items.splice(itemIndex, 1); // 自动移除数量为0的商品
        }
      }
    })
  );
```

## 最佳实践

1. **保持 updater 函数简洁**：每个 updater 应该专注于单一职责
2. **使用 TypeScript**：确保类型安全
3. **避免在 updater 中进行异步操作**：Immer 的 draft 应该同步修改
4. **利用 Immer 的自动优化**：Immer 会自动检测没有变化的部分并复用

## 性能优势

- **结构共享**：未修改的部分会被复用，减少内存使用
- **自动优化**：Immer 只在真正有变化时才创建新对象
- **减少开发错误**：不容易出现浅拷贝导致的 bug

通过使用 Immer，我们的状态管理代码变得更加简洁、直观和维护友好！

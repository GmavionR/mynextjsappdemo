'use client';

import { useState, useCallback, useSyncExternalStore } from 'react';
import { produce } from 'immer';
import { type Dish } from '../types/index';
import { type DishCategoryId } from '../types/constants';

// 客户端状态类型
interface ClientDishesState {
  dishes: Record<DishCategoryId, Dish[]>;
  loading: boolean;
  error: string | null;
  isInitialized: boolean;
}

// 初始状态
const initialState: ClientDishesState = {
  dishes: {} as Record<DishCategoryId, Dish[]>,
  loading: false,
  error: null,
  isInitialized: false,
};

// 全局状态存储
let globalState: ClientDishesState = { ...initialState };
const subscribers = new Set<() => void>();

// 订阅状态变化
const subscribe = (callback: () => void) => {
  subscribers.add(callback);
  return () => {
    subscribers.delete(callback);
  };
};

// 获取当前状态快照
const getSnapshot = () => globalState;

// 服务端快照（SSR 安全）
const getServerSnapshot = () => initialState;

// 通知所有订阅者
const notifySubscribers = () => {
  subscribers.forEach(callback => callback());
};

// 使用 Immer 更新全局状态
const updateGlobalState = (updater: (draft: ClientDishesState) => void) => {
  globalState = produce(globalState, updater);
  notifySubscribers();
};

// 主要的客户端安全的菜品数据 hook
export function useClientDishesState() {
  // 使用 useSyncExternalStore 来订阅全局状态
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const fetchDishes = useCallback(async () => {
    // 开始加载状态
    updateGlobalState(draft => {
      draft.loading = true;
      draft.error = null;
    });
    
    try {
      const response = await fetch('/api/dishes');
      const result = await response.json();
      
      if (result.success) {
        // 成功更新数据
        updateGlobalState(draft => {
          draft.dishes = result.data;
          draft.loading = false;
          draft.isInitialized = true;
        });
      } else {
        throw new Error(result.message || '获取菜品数据失败');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '未知错误';
      // 错误状态更新
      updateGlobalState(draft => {
        draft.loading = false;
        draft.error = errorMessage;
        draft.isInitialized = true;
      });
    }
  }, []);

  const fetchDishesByCategory = useCallback(async (category: DishCategoryId) => {
    // 开始加载状态
    updateGlobalState(draft => {
      draft.loading = true;
      draft.error = null;
    });
    
    try {
      const response = await fetch(`/api/dishes?category=${category}`);
      const result = await response.json();
      
      if (result.success) {
        // 合并分类数据
        updateGlobalState(draft => {
          Object.assign(draft.dishes, result.data);
          draft.loading = false;
          draft.isInitialized = true;
        });
      } else {
        throw new Error(result.message || '获取菜品数据失败');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '未知错误';
      // 错误状态更新
      updateGlobalState(draft => {
        draft.loading = false;
        draft.error = errorMessage;
        draft.isInitialized = true;
      });
    }
  }, []);

  const clearError = useCallback(() => {
    updateGlobalState(draft => {
      draft.error = null;
    });
  }, []);

  const reset = useCallback(() => {
    updateGlobalState(draft => {
      Object.assign(draft, initialState);
    });
  }, []);

  // 添加菜品到特定分类（新功能，展示 Immer 的便利性）
  const addDishToCategory = useCallback((category: DishCategoryId, dish: Dish) => {
    updateGlobalState(draft => {
      if (!draft.dishes[category]) {
        draft.dishes[category] = [];
      }
      draft.dishes[category].push(dish);
    });
  }, []);

  // 更新菜品信息（新功能）
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

  // 从分类中删除菜品（新功能）
  const removeDishFromCategory = useCallback((category: DishCategoryId, dishId: string) => {
    updateGlobalState(draft => {
      if (draft.dishes[category]) {
        draft.dishes[category] = draft.dishes[category].filter(dish => dish.id !== dishId);
      }
    });
  }, []);

  // 清理订阅
  const cleanup = useCallback(() => {
    // useSyncExternalStore 会自动处理清理，这里保留兼容性
  }, []);

  return {
    // 状态
    dishes: state.dishes,
    loading: state.loading,
    error: state.error,
    isInitialized: state.isInitialized,
    
    // 基础操作
    fetchDishes,
    fetchDishesByCategory,
    clearError,
    reset,
    cleanup,
    
    // 新增的便利操作（得益于 Immer）
    addDishToCategory,
    updateDish,
    removeDishFromCategory,
  };
}

// 为了向后兼容，保留旧的分离式 hooks
export function useClientDishesData(): Record<DishCategoryId, Dish[]> {
  const { dishes } = useClientDishesState();
  return dishes;
}

export function useClientDishesLoading(): boolean {
  const { loading } = useClientDishesState();
  return loading;
}

export function useClientDishesError(): string | null {
  const { error } = useClientDishesState();
  return error;
}

export function useClientDishesActions() {
  const { fetchDishes, fetchDishesByCategory, clearError, reset } = useClientDishesState();
  return {
    fetchDishes,
    fetchDishesByCategory,
    clearError,
    reset,
  };
}

import { useState, useEffect } from 'react';
import { Dish } from '../stores/dishes';
import { DishCategoryId } from '../types/constants';

interface UseSearchResult {
  searchQuery: string;
  searchResults: Dish[];
  searchHistory: string[];
  setSearchQuery: (query: string) => void;
  handleSearch: (query: string) => void;
  handleSearchSubmit: (query: string) => void;
  clearHistory: () => void;
}

export function useSearch(menuData: Record<DishCategoryId, Dish[]>): UseSearchResult {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Dish[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // 加载搜索历史
  useEffect(() => {
    const history = localStorage.getItem('searchHistory');
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  }, []);

  // 保存搜索历史
  const saveToHistory = (query: string) => {
    if (!query.trim()) return;
    
    const newHistory = [
      query,
      ...searchHistory.filter(item => item !== query)
    ].slice(0, 10); // 只保留最近10条记录
    
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  };

  // 清空搜索历史
  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  };

  // 处理搜索
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    // 搜索所有分类中的菜品
    const results: Dish[] = [];
    Object.values(menuData).forEach(dishes => {
      dishes.forEach(dish => {
        if (dish.name.toLowerCase().includes(query.toLowerCase())) {
          results.push(dish);
        }
      });
    });
    setSearchResults(results);
  };

  // 处理搜索提交
  const handleSearchSubmit = (query: string) => {
    handleSearch(query);
    saveToHistory(query);
  };

  return {
    searchQuery,
    searchResults,
    searchHistory,
    setSearchQuery,
    handleSearch,
    handleSearchSubmit,
    clearHistory,
  };
} 
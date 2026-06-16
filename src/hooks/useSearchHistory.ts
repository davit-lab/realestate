import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'newlife_search_history';
const MAX_ITEMS = 10;

export interface SearchHistoryItem {
  id: string;
  query: string;
  filters: Record<string, string>;
  timestamp: string;
}

export function useSearchHistory() {
  const [history, setHistory] = useState<SearchHistoryItem[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch { /* noop */ }
  }, [history]);

  const addSearch = useCallback((query: string, filters: Record<string, string> = {}) => {
    if (!query.trim() && Object.keys(filters).length === 0) return;
    setHistory(prev => {
      const filtered = prev.filter(
        item => item.query !== query || JSON.stringify(item.filters) !== JSON.stringify(filters)
      );
      const newItem: SearchHistoryItem = {
        id: `search-${Date.now()}`,
        query: query.trim(),
        filters,
        timestamp: new Date().toISOString(),
      };
      return [newItem, ...filtered].slice(0, MAX_ITEMS);
    });
  }, []);

  const removeSearch = useCallback((id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  return { history, addSearch, removeSearch, clearHistory };
}

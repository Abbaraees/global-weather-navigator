import { useState, useEffect, useCallback, useRef } from 'react';
import { searchLocations } from '../services/weatherApi';
import type { LocationSuggestion } from '../types/weather';

type UseLocationSearchReturn = {
  suggestions: LocationSuggestion[];
  loading: boolean;
  error: string | null;
  searchLocations: (query: string) => void;
  clearSuggestions: () => void;
};

export function useLocationSearch(debounceMs: number = 300): UseLocationSearchReturn {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const performSearch = useCallback(async (query: string) => {
    if (!query.trim() || query.trim().length < 2) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const results = await searchLocations(query.trim(), 8);
      if (mountedRef.current) {
        setSuggestions(results);
      }
    } catch (err: any) {
      if (mountedRef.current) {
        setError(err?.message ?? 'Failed to search locations');
        setSuggestions([]);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  const searchLocationsDebounced = useCallback((query: string) => {
    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Clear suggestions immediately if query is empty
    if (!query.trim()) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    // Set loading state immediately for queries longer than 2 characters
    if (query.trim().length >= 2) {
      setLoading(true);
    }

    // Set new timeout
    debounceTimeoutRef.current = setTimeout(() => {
      performSearch(query);
    }, debounceMs);
  }, [performSearch, debounceMs]);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setError(null);
    setLoading(false);
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
  }, []);

  return {
    suggestions,
    loading,
    error,
    searchLocations: searchLocationsDebounced,
    clearSuggestions,
  };
}

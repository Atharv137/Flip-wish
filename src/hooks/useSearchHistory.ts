import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "electromart_search_history";
const MAX_HISTORY_ITEMS = 10;
const CUSTOM_EVENT = "electromart:search-history-updated";

/**
 * Safely read search history array from localStorage.
 */
function getStoredHistory(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // Handle legacy object items or string items
      return parsed
        .map((item) => (typeof item === "string" ? item : item?.query || item?.term || ""))
        .filter((term: string) => typeof term === "string" && term.trim().length > 0)
        .slice(0, MAX_HISTORY_ITEMS);
    }
  } catch (err) {
    console.warn("Failed to read search history from localStorage:", err);
  }
  return [];
}

/**
 * Safely persist search history array to localStorage and notify listeners.
 */
function setStoredHistory(history: string[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    // Dispatch custom event for real-time sync across components in the same window
    window.dispatchEvent(new CustomEvent(CUSTOM_EVENT, { detail: history }));
  } catch (err) {
    console.warn("Failed to save search history to localStorage:", err);
  }
}

/**
 * Hook to manage persisted search history in localStorage.
 */
export function useSearchHistory() {
  const [history, setHistory] = useState<string[]>(() => getStoredHistory());

  // Listen for storage events (cross-tab) and custom events (same-window)
  useEffect(() => {
    const handleSync = () => {
      setHistory(getStoredHistory());
    };

    window.addEventListener("storage", handleSync);
    window.addEventListener(CUSTOM_EVENT, handleSync);

    return () => {
      window.removeEventListener("storage", handleSync);
      window.removeEventListener(CUSTOM_EVENT, handleSync);
    };
  }, []);

  /**
   * Add a new search term to history.
   * Cleans, deduplicates case-insensitively, moves to front, and caps at MAX_HISTORY_ITEMS.
   */
  const addSearch = useCallback((term: string) => {
    const trimmed = term.trim();
    if (!trimmed || trimmed.length < 2) return;

    setHistory((prev) => {
      const lower = trimmed.toLowerCase();
      const filtered = prev.filter((item) => item.toLowerCase() !== lower);
      const next = [trimmed, ...filtered].slice(0, MAX_HISTORY_ITEMS);
      setStoredHistory(next);
      return next;
    });
  }, []);

  /**
   * Remove a single search term from history.
   */
  const removeSearch = useCallback((termToRemove: string) => {
    setHistory((prev) => {
      const lower = termToRemove.trim().toLowerCase();
      const next = prev.filter((item) => item.toLowerCase() !== lower);
      setStoredHistory(next);
      return next;
    });
  }, []);

  /**
   * Clear all search history.
   */
  const clearHistory = useCallback(() => {
    setStoredHistory([]);
    setHistory([]);
  }, []);

  return {
    history,
    addSearch,
    removeSearch,
    clearHistory,
  };
}

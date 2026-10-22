import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, History, Clock, X, ArrowUpRight, Sparkles } from "lucide-react";
import { useSearchDebounce } from "../hooks/useSearchDebounce";
import { useSearchHistory } from "../hooks/useSearchHistory";

interface ProductSearchBarProps {
  variant?: "desktop" | "mobile";
  placeholder?: string;
  className?: string;
}

const POPULAR_SUGGESTIONS = [
  "iPhone 16 Pro",
  "MacBook Air M4",
  "Sony WH-1000XM6",
  "Galaxy S25 Ultra",
  "AirPods Pro",
  "Smart Watches",
  "Gaming Laptops"
];

export const ProductSearchBar: React.FC<ProductSearchBarProps> = ({
  variant = "desktop",
  placeholder = "Search for products, brands and categories...",
  className = ""
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlSearch = searchParams.get("search") || "";

  const [searchVal, setSearchVal] = useState(urlSearch);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { history, addSearch, removeSearch, clearHistory } = useSearchHistory();
  const debouncedSearch = useSearchDebounce(searchVal, 600);

  // Sync internal state when URL search param changes
  useEffect(() => {
    setSearchVal(urlSearch);
  }, [urlSearch]);

  // Debounced navigation when typing (only when user actively changes searchVal)
  useEffect(() => {
    const currentUrl = searchParams.get("search") || "";
    const trimmed = debouncedSearch.trim();

    if (trimmed !== currentUrl) {
      if (trimmed) {
        navigate(`/?search=${encodeURIComponent(trimmed)}`);
        // Add to history after user pauses typing a valid query
        if (trimmed.length >= 2) {
          addSearch(trimmed);
        }
      } else if (debouncedSearch === "" && currentUrl !== "") {
        navigate("/");
      }
    }
  }, [debouncedSearch, navigate, searchParams, addSearch]);

  // Click outside listener to dismiss dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Filter history based on current search input
  const filteredHistory = history.filter((term) =>
    searchVal.trim() === ""
      ? true
      : term.toLowerCase().includes(searchVal.trim().toLowerCase())
  );

  // Execute search and save to history
  const executeSearch = (term: string) => {
    const cleanTerm = term.trim();
    if (cleanTerm) {
      addSearch(cleanTerm);
      setSearchVal(cleanTerm);
      navigate(`/?search=${encodeURIComponent(cleanTerm)}`);
    } else {
      setSearchVal("");
      navigate("/");
    }
    setIsOpen(false);
    setHighlightedIndex(-1);
    inputRef.current?.blur();
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (highlightedIndex >= 0 && highlightedIndex < filteredHistory.length) {
      executeSearch(filteredHistory[highlightedIndex]);
    } else {
      executeSearch(searchVal);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setIsOpen(true);
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < filteredHistory.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredHistory.length - 1
      );
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  const handleClearInput = () => {
    setSearchVal("");
    navigate("/");
    inputRef.current?.focus();
  };

  // Helper to highlight matching characters
  const renderHighlightedText = (text: string, query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return text;

    const regex = new RegExp(`(${trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, i) =>
      part.toLowerCase() === trimmed.toLowerCase() ? (
        <span key={i} className="text-[#7C3AED] font-bold bg-purple-50 px-0.5 rounded">
          {part}
        </span>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  };

  const isDesktop = variant === "desktop";

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <form onSubmit={handleFormSubmit} className="relative w-full">
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-label="Search for products, brands and categories"
          placeholder={placeholder}
          value={searchVal}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setSearchVal(e.target.value);
            setIsOpen(true);
            setHighlightedIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          className={`w-full bg-white text-slate-800 placeholder-slate-400 rounded shadow-inner focus:outline-none transition-all ${
            isDesktop
              ? "pl-4 pr-16 py-2 text-sm focus:ring-2 focus:ring-[#FFE500]"
              : "pl-3.5 pr-14 py-1.5 text-xs focus:ring-1 focus:ring-[#FFE500]"
          }`}
        />

        {/* Right side actions inside search bar */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-400">
          {searchVal && (
            <button
              type="button"
              onClick={handleClearInput}
              aria-label="Clear search input"
              className="p-1 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className={isDesktop ? "w-3.5 h-3.5" : "w-3 h-3"} />
            </button>
          )}

          <button
            type="submit"
            aria-label="Submit search"
            className="p-1 hover:text-[#7C3AED] transition-colors cursor-pointer"
          >
            <Search className={isDesktop ? "w-4.5 h-4.5" : "w-4 h-4"} />
          </button>
        </div>
      </form>

      {/* Dropdown Menu for Search History & Suggestions */}
      {isOpen && (
        <div
          role="listbox"
          className="absolute left-0 right-0 top-full mt-1.5 bg-white text-slate-800 rounded-lg shadow-xl border border-slate-200 z-50 overflow-hidden text-left"
        >
          {/* Recent Searches Section */}
          {history.length > 0 && (
            <div className="border-b border-slate-100">
              <div className="flex items-center justify-between px-3.5 py-2 bg-slate-50/80 text-xs font-semibold text-slate-500">
                <span className="flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-[#7C3AED]" />
                  <span>Recent Searches</span>
                </span>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault(); // Prevent input blur
                    clearHistory();
                  }}
                  className="text-[11px] font-medium text-[#7C3AED] hover:text-[#fb641b] hover:underline cursor-pointer transition-colors"
                >
                  Clear all
                </button>
              </div>

              {filteredHistory.length > 0 ? (
                <ul className="py-1 max-h-56 overflow-y-auto divide-y divide-slate-50">
                  {filteredHistory.map((term, index) => {
                    const isHighlighted = index === highlightedIndex;
                    return (
                      <li
                        key={term}
                        role="option"
                        aria-selected={isHighlighted}
                        className={`flex items-center justify-between px-3.5 py-2 text-xs md:text-sm cursor-pointer transition-colors ${
                          isHighlighted
                            ? "bg-purple-50 text-[#7C3AED] font-medium"
                            : "hover:bg-slate-50 text-slate-700"
                        }`}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          executeSearch(term);
                        }}
                      >
                        <div className="flex items-center gap-2.5 flex-1 min-w-0 pr-2">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">
                            {renderHighlightedText(term, searchVal)}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            aria-label={`Remove "${term}" from search history`}
                            title="Remove from history"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              removeSearch(term);
                            }}
                            className="p-1 text-slate-300 hover:text-rose-500 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="px-3.5 py-2.5 text-xs text-slate-400 italic">
                  No previous searches match "{searchVal}"
                </div>
              )}
            </div>
          )}

          {/* Popular / Recommended Searches Section */}
          <div className="p-3 bg-white">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#FFE500] fill-[#FFE500]" />
              <span>{history.length > 0 ? "Popular Searches" : "Trending on Electromart"}</span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {POPULAR_SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    executeSearch(suggestion);
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-[#7C3AED] hover:border-purple-200 border border-transparent text-xs font-medium transition-colors cursor-pointer"
                >
                  <span>{suggestion}</span>
                  <ArrowUpRight className="w-3 h-3 text-slate-400" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

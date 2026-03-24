"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { performSearch, type SearchResult } from "@/services/search-service";
import { SearchResults } from "./search-results";
import { TooltipIconButton } from "./tooltip-icon-button";

export function GlowingSearch({
  placeholder = "Search...",
  className,
  onSearch,
}: {
  placeholder?: string;
  className?: string;
  onSearch?: (query: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ contextual: SearchResult[]; global: SearchResult[] }>({ contextual: [], global: [] });
  const [recentSearches, setRecentSearches] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const searchTimeout = useRef<NodeJS.Timeout>(null);

  // Load recent searches on mount
  useEffect(() => {
    const saved = sessionStorage.getItem("shopro_recent_searches");
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse recent searches", e);
      }
    }
  }, []);

  const saveToRecent = (result: SearchResult) => {
    const updated = [result, ...recentSearches.filter(r => r.id !== result.id)].slice(0, 5);
    setRecentSearches(updated);
    sessionStorage.setItem("shopro_recent_searches", JSON.stringify(updated));
  };

  const flatResults = query.length >= 2 
    ? [...results.contextual, ...results.global]
    : recentSearches;

  const handleSearch = useCallback(async (q: string) => {
    if (!q || q.length < 2) {
      setResults({ contextual: [], global: [] });
      setSelectedIndex(recentSearches.length > 0 ? 0 : -1);
      return;
    }

    setIsLoading(true);
    const res = await performSearch(q, location.pathname);
    setResults(res);
    setSelectedIndex(res.contextual.length > 0 || res.global.length > 0 ? 0 : -1);
    setIsLoading(false);
  }, [location.pathname]);

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      handleSearch(query);
      if (onSearch) onSearch(query);
    }, 300);
    return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current); };
  }, [query, handleSearch]);

  const handleSelect = (result: SearchResult) => {
    saveToRecent(result);
    setIsOpen(false);
    setQuery("");
    navigate(result.route);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => (prev < flatResults.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === "Enter") {
      if (selectedIndex >= 0 && flatResults[selectedIndex]) {
        handleSelect(flatResults[selectedIndex]);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={cn("relative inline-flex items-center group", className)}>

      {/* Animated border — spinning conic gradient masked to a 2px ring */}
      <div className="absolute inset-[-2px] rounded-[14px] p-[2px] [background:conic-gradient(from_var(--a),#402fb5_0%,#cf30aa_20%,#a099d8_40%,#402fb5_60%,#cf30aa_80%,#402fb5_100%)] [--a:0deg] animate-[spin-border_3s_linear_infinite] [mask:linear-gradient(#000_0_0)_content-box,linear-gradient(#000_0_0)] mask-exclude" />

      {/* Blurred glow copy behind it */}
      <div className="absolute inset-[-3px] rounded-[15px] -z-10 opacity-60 blur-[6px] [background:conic-gradient(from_var(--a),#402fb5_0%,#cf30aa_20%,#a099d8_40%,#402fb5_60%,#cf30aa_80%,#402fb5_100%)] [--a:0deg] animate-[spin-border_3s_linear_infinite]" />

      {/* Search lens icon */}
      <div className="absolute left-[15px] z-10 pointer-events-none">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="7" stroke="url(#sg-a)" />
          <line x1="16.5" y1="16.5" x2="21" y2="21" stroke="url(#sg-b)" />
          <defs>
            <linearGradient id="sg-a" gradientTransform="rotate(45)">
              <stop offset="0%" stopColor="#a099d8" /><stop offset="100%" stopColor="#cf30aa" />
            </linearGradient>
            <linearGradient id="sg-b" gradientTransform="rotate(45)">
              <stop offset="0%" stopColor="#cf30aa" /><stop offset="100%" stopColor="#402fb5" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <input
        type="text"
        value={query}
        placeholder={placeholder}
        autoComplete="off"
        onFocus={() => setIsOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        onKeyDown={onKeyDown}
        className={cn(
          "relative z-1 w-[300px] h-[52px] rounded-xl border-none outline-none transition-all duration-300",
          "pl-[48px] pr-[52px] text-[15px]",
          "bg-[#f3f1fa] text-[#1a1625] placeholder:text-[#9a94b0]",
          "dark:bg-[#0d0b12] dark:text-[#e8e4f6] dark:placeholder:text-[#6b647e]",
          isOpen && query.length >= 2 && "w-[450px]"
        )}
      />

      {/* Fade mask — hides text runoff before filter button */}
      <div className={cn(
        "absolute z-2 w-[60px] h-8 pointer-events-none bg-linear-to-r from-transparent to-[#f3f1fa] dark:to-[#0d0b12] transition-all",
        isOpen && query.length >= 2 ? "right-[52px] opacity-0" : "right-[52px]"
      )} />

      {/* Filter button */}
      <div className="absolute right-2 z-2">
        <TooltipIconButton tooltip="Filter Search" className="w-9 h-9 bg-linear-to-br from-[#ede9f8] to-[#ddd6f3] dark:from-[#1a1530] dark:to-[#0d0b1a]">
          <svg width="16" height="16" viewBox="4.8 4.56 14.832 15.408" fill="none">
            <path d="M8.16 6.65H15.83C16.47 6.65 16.99 7.17 16.99 7.81V9.09C16.99 9.56 16.7 10.14 16.41 10.43L13.91 12.64C13.56 12.93 13.33 13.51 13.33 13.98V16.48C13.33 16.83 13.1 17.29 12.81 17.47L12 17.98C11.24 18.45 10.2 17.92 10.2 16.99V13.91C10.2 13.5 9.97 12.98 9.73 12.69L7.52 10.36C7.23 10.08 7 9.55 7 9.2V7.87C7 7.17 7.52 6.65 8.16 6.65Z"
              className="stroke-[#7c6fc7] dark:stroke-[#c4baee]"
              strokeWidth="1.2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </TooltipIconButton>
      </div>

      {isOpen && (
        <SearchResults 
          results={query.length >= 2 ? results : { contextual: [], global: recentSearches }} 
          selectedIndex={selectedIndex} 
          onSelect={handleSelect}
          isLoading={isLoading}
          isRecent={query.length < 2}
        />
      )}
    </div>
  );
}
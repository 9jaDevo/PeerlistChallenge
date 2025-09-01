"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SPRING, DURATIONS, FadeIn, ScaleIn } from "../motion/Primitives";
import { useStore } from "../../lib/store";
import { 
  ARIA_LABELS, 
  ScreenReader, 
  handleKeyboardNavigation 
} from "../../lib/a11y";

// Search result types
export type SearchResultType = 'person' | 'project' | 'document' | 'message' | 'file' | 'action';

export interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  description?: string;
  subtitle?: string;
  category?: string;
  tags?: string[];
  lastModified?: Date;
  url?: string;
  icon?: string;
  avatar?: string;
  score?: number;
  highlighted?: string[];
}

export interface SearchCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  count: number;
}

interface SmartSearchProps {
  placeholder?: string;
  maxResults?: number;
  showCategories?: boolean;
  showRecentSearches?: boolean;
  autoFocus?: boolean;
  onResultClick?: (result: SearchResult) => void;
  onSearchChange?: (query: string) => void;
  className?: string;
}

// Sample search data
const SAMPLE_RESULTS: SearchResult[] = [
  {
    id: '1',
    type: 'person',
    title: 'Sarah Johnson',
    subtitle: 'Senior Product Designer',
    description: 'Working on design system and user research',
    avatar: '👩‍💼',
    tags: ['design', 'ui/ux', 'figma'],
    score: 0.95
  },
  {
    id: '2',
    type: 'project',
    title: 'FLUX Design System',
    subtitle: 'Active Project',
    description: 'Comprehensive design system for all products',
    icon: '🎨',
    tags: ['design-system', 'components', 'tokens'],
    score: 0.92
  },
  {
    id: '3',
    type: 'document',
    title: 'Q4 Product Roadmap',
    subtitle: 'Last updated 2 days ago',
    description: 'Strategic planning document for upcoming features',
    icon: '📋',
    tags: ['planning', 'strategy', 'roadmap'],
    lastModified: new Date('2025-08-29'),
    score: 0.88
  },
  {
    id: '4',
    type: 'message',
    title: 'Team standup notes',
    subtitle: 'From #dev-team channel',
    description: 'Daily standup recap and action items',
    icon: '💬',
    tags: ['meeting', 'standup', 'notes'],
    score: 0.85
  },
  {
    id: '5',
    type: 'file',
    title: 'user-research-findings.pdf',
    subtitle: '2.3 MB • PDF Document',
    description: 'Latest user research insights and recommendations',
    icon: '📄',
    tags: ['research', 'users', 'insights'],
    score: 0.82
  },
  {
    id: '6',
    type: 'action',
    title: 'Create new project',
    subtitle: 'Quick action',
    description: 'Start a new project with templates',
    icon: '➕',
    tags: ['create', 'project', 'template'],
    score: 0.80
  },
  {
    id: '7',
    type: 'person',
    title: 'Alex Chen',
    subtitle: 'Frontend Developer',
    description: 'React specialist and component library maintainer',
    avatar: '👨‍💻',
    tags: ['frontend', 'react', 'javascript'],
    score: 0.78
  },
  {
    id: '8',
    type: 'document',
    title: 'API Documentation',
    subtitle: 'Technical Reference',
    description: 'Complete API reference for developers',
    icon: '📖',
    tags: ['api', 'documentation', 'reference'],
    score: 0.75
  }
];

const SEARCH_CATEGORIES: SearchCategory[] = [
  { id: 'all', name: 'All Results', icon: '🔍', color: '#7C3AED', count: 0 },
  { id: 'person', name: 'People', icon: '👥', color: '#06B6D4', count: 0 },
  { id: 'project', name: 'Projects', icon: '🚀', color: '#22C55E', count: 0 },
  { id: 'document', name: 'Documents', icon: '📄', color: '#F59E0B', count: 0 },
  { id: 'message', name: 'Messages', icon: '💬', color: '#EF4444', count: 0 },
  { id: 'file', name: 'Files', icon: '📁', color: '#8B5CF6', count: 0 },
  { id: 'action', name: 'Actions', icon: '⚡', color: '#10B981', count: 0 }
];

export function SmartSearch({
  placeholder = "Search everything...",
  maxResults = 8,
  showCategories = true,
  showRecentSearches = true,
  autoFocus = false,
  onResultClick,
  onSearchChange,
  className = ""
}: SmartSearchProps) {
  const { markDayComplete, preferences } = useStore();
  
  // Search state
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [recentSearches, setRecentSearches] = useState<string[]>([
    "design system", "user research", "API docs"
  ]);
  
  // Refs
  const searchInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  // Filter and search results
  const filteredResults = useMemo(() => {
    if (!query.trim()) return [];

    let results = SAMPLE_RESULTS.filter(result => {
      const searchText = `${result.title} ${result.description} ${result.subtitle} ${result.tags?.join(' ')}`.toLowerCase();
      const queryLower = query.toLowerCase();
      
      // Simple fuzzy matching
      const words = queryLower.split(' ').filter(w => w.length > 0);
      return words.every(word => searchText.includes(word));
    });

    // Filter by category
    if (selectedCategory !== 'all') {
      results = results.filter(result => result.type === selectedCategory);
    }

    // Sort by relevance score
    results.sort((a, b) => (b.score || 0) - (a.score || 0));

    // Highlight matching text
    results = results.map(result => ({
      ...result,
      highlighted: highlightText(result.title, query)
    }));

    return results.slice(0, maxResults);
  }, [query, selectedCategory, maxResults]);

  // Update category counts
  const categoriesWithCounts = useMemo(() => {
    const counts = SAMPLE_RESULTS.reduce((acc, result) => {
      acc[result.type] = (acc[result.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return SEARCH_CATEGORIES.map(category => ({
      ...category,
      count: category.id === 'all' ? SAMPLE_RESULTS.length : counts[category.id] || 0
    }));
  }, []);

  // Highlight matching text
  const highlightText = (text: string, searchQuery: string): string[] => {
    if (!searchQuery.trim()) return [text];
    
    const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.split(regex);
  };

  // Handle search input
  const handleSearchChange = useCallback((value: string) => {
    setQuery(value);
    setSelectedIndex(-1);
    setIsOpen(value.length > 0);
    
    // Debounced search
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    
    searchTimeout.current = setTimeout(() => {
      onSearchChange?.(value);
      if (value.length > 0) {
        ScreenReader.announce(`Found ${filteredResults.length} results for "${value}"`, 'polite');
      }
    }, 300);
  }, [onSearchChange, filteredResults.length]);

  // Handle result selection
  const handleResultClick = useCallback((result: SearchResult) => {
    setQuery('');
    setIsOpen(false);
    
    // Add to recent searches
    setRecentSearches(prev => {
      const newRecent = [query, ...prev.filter(s => s !== query)].slice(0, 3);
      return newRecent;
    });
    
    onResultClick?.(result);
    
    ScreenReader.announce(`Selected ${result.title}`, 'polite');
    
    // Mark day complete on interaction
    markDayComplete(6);
  }, [query, onResultClick, markDayComplete]);

  // Handle recent search click
  const handleRecentSearch = useCallback((searchTerm: string) => {
    setQuery(searchTerm);
    handleSearchChange(searchTerm);
    searchInputRef.current?.focus();
  }, [handleSearchChange]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredResults.length - 1 ? prev + 1 : prev
        );
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > -1 ? prev - 1 : -1);
        break;
        
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && filteredResults[selectedIndex]) {
          handleResultClick(filteredResults[selectedIndex]);
        }
        break;
        
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        searchInputRef.current?.blur();
        break;
        
      case 'Tab':
        if (e.shiftKey && selectedIndex <= 0) {
          setIsOpen(false);
        }
        break;
    }
  }, [isOpen, selectedIndex, filteredResults, handleResultClick]);

  // Auto focus
  useEffect(() => {
    if (autoFocus && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [autoFocus]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (resultsRef.current && !resultsRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup timeout
  useEffect(() => {
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, []);

  return (
    <div className={`relative w-full max-w-2xl ${className}`} ref={resultsRef}>
      {/* Search Input */}
      <div className="relative">
        <motion.div
          className="relative"
          whileFocus={{ scale: 1.02 }}
          transition={SPRING}
        >
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              🔍
            </motion.div>
          </div>
          
          <input
            ref={searchInputRef}
            type="text"
            value={query}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => query.length > 0 && setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={`
              w-full pl-12 pr-4 py-4 bg-surface/10 border border-white/20 rounded-xl
              text-white placeholder-gray-400 text-lg
              focus:outline-none focus:border-brand focus:bg-surface/20
              transition-all duration-200
              ${isOpen ? 'rounded-b-none border-b-transparent' : ''}
            `}
            aria-label="Search input"
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            aria-autocomplete="list"
          />

          {/* Clear button */}
          <AnimatePresence>
            {query && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => {
                  setQuery('');
                  setIsOpen(false);
                  searchInputRef.current?.focus();
                }}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-white transition-colors"
                aria-label="Clear search"
              >
                ✕
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Search Results Dropdown */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute z-50 w-full bg-surface border border-white/20 border-t-0 rounded-b-xl shadow-2xl max-h-96 overflow-hidden"
            >
              {/* Categories */}
              {showCategories && (
                <div className="p-4 border-b border-white/10">
                  <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                    {categoriesWithCounts.map((category) => (
                      <motion.button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`
                          flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
                          whitespace-nowrap transition-all duration-200
                          ${selectedCategory === category.id
                            ? 'bg-brand/20 text-brand border border-brand/30'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                          }
                        `}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <span>{category.icon}</span>
                        <span>{category.name}</span>
                        <span className="text-xs opacity-70">({category.count})</span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Results */}
              <div className="max-h-80 overflow-y-auto">
                {filteredResults.length > 0 ? (
                  <div role="listbox" aria-label="Search results">
                    {filteredResults.map((result, index) => (
                      <motion.div
                        key={result.id}
                        role="option"
                        aria-selected={selectedIndex === index}
                        className={`
                          p-4 cursor-pointer transition-all duration-150
                          ${selectedIndex === index 
                            ? 'bg-brand/10 border-l-2 border-brand' 
                            : 'hover:bg-white/5'
                          }
                          ${index !== filteredResults.length - 1 ? 'border-b border-white/5' : ''}
                        `}
                        onClick={() => handleResultClick(result)}
                        onMouseEnter={() => setSelectedIndex(index)}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ x: 4 }}
                      >
                        <div className="flex items-center gap-3">
                          {/* Icon/Avatar */}
                          <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                            {result.avatar || result.icon || '📄'}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h3 className="text-white font-medium truncate">
                                {result.highlighted?.map((part, i) => (
                                  <span
                                    key={i}
                                    className={i % 2 === 1 ? 'bg-brand/30 text-brand' : ''}
                                  >
                                    {part}
                                  </span>
                                )) || result.title}
                              </h3>
                              <span className="text-xs text-gray-500 ml-2">
                                {result.type}
                              </span>
                            </div>
                            
                            {result.subtitle && (
                              <p className="text-sm text-gray-400 truncate mt-1">
                                {result.subtitle}
                              </p>
                            )}
                            
                            {result.description && (
                              <p className="text-xs text-gray-500 truncate mt-1">
                                {result.description}
                              </p>
                            )}

                            {/* Tags */}
                            {result.tags && result.tags.length > 0 && (
                              <div className="flex items-center gap-1 mt-2">
                                {result.tags.slice(0, 3).map((tag, i) => (
                                  <span
                                    key={i}
                                    className="px-2 py-1 bg-white/5 text-gray-400 text-xs rounded"
                                  >
                                    {tag}
                                  </span>
                                ))}
                                {result.tags.length > 3 && (
                                  <span className="text-gray-500 text-xs">
                                    +{result.tags.length - 3} more
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Arrow */}
                          <div className="flex-shrink-0 text-gray-400">
                            <motion.div
                              animate={{ x: selectedIndex === index ? 4 : 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              →
                            </motion.div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : query.length > 0 ? (
                  <div className="p-8 text-center text-gray-400">
                    <div className="text-4xl mb-4">🔍</div>
                    <h3 className="text-lg font-medium text-white mb-2">No results found</h3>
                    <p className="text-sm">
                      Try adjusting your search terms or browse categories above.
                    </p>
                  </div>
                ) : (
                  /* Recent Searches */
                  showRecentSearches && recentSearches.length > 0 && (
                    <div className="p-4">
                      <h3 className="text-sm font-medium text-gray-400 mb-3">Recent Searches</h3>
                      <div className="space-y-1">
                        {recentSearches.map((search, index) => (
                          <motion.button
                            key={index}
                            onClick={() => handleRecentSearch(search)}
                            className="w-full text-left p-2 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-colors flex items-center gap-3"
                            whileHover={{ x: 4 }}
                          >
                            <span className="text-gray-500">🕒</span>
                            <span className="text-sm">{search}</span>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )
                )}
              </div>

              {/* Footer */}
              {filteredResults.length > 0 && (
                <div className="p-3 bg-white/5 border-t border-white/10 text-center">
                  <p className="text-xs text-gray-500">
                    Use ↑↓ to navigate • Enter to select • Esc to close
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
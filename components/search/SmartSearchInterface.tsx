"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FadeIn, ScaleIn, SPRING } from "../motion/Primitives";
import { SmartSearch, SearchResult } from "./SmartSearch";
import { useStore } from "../../lib/store";

// Command palette actions
export interface Command {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  icon: string;
  category: 'navigation' | 'create' | 'edit' | 'view' | 'system';
  shortcut?: string;
  action: () => void;
}

const SAMPLE_COMMANDS: Command[] = [
  {
    id: 'new-project',
    title: 'Create New Project',
    subtitle: 'Start from templates',
    description: 'Create a new project with predefined templates and structure',
    icon: '🚀',
    category: 'create',
    shortcut: '⌘N',
    action: () => console.log('Creating new project...')
  },
  {
    id: 'open-settings',
    title: 'Open Settings',
    subtitle: 'Preferences & configuration',
    description: 'Access application settings and preferences',
    icon: '⚙️',
    category: 'system',
    shortcut: '⌘,',
    action: () => console.log('Opening settings...')
  },
  {
    id: 'search-files',
    title: 'Search Files',
    subtitle: 'Find files quickly',
    description: 'Search through all files in the current workspace',
    icon: '📄',
    category: 'navigation',
    shortcut: '⌘P',
    action: () => console.log('Opening file search...')
  },
  {
    id: 'toggle-theme',
    title: 'Toggle Dark Mode',
    subtitle: 'Switch appearance',
    description: 'Toggle between light and dark themes',
    icon: '🌙',
    category: 'view',
    shortcut: '⌘D',
    action: () => console.log('Toggling theme...')
  },
  {
    id: 'export-data',
    title: 'Export Data',
    subtitle: 'Download your data',
    description: 'Export your data in various formats',
    icon: '📤',
    category: 'edit',
    shortcut: '⌘E',
    action: () => console.log('Exporting data...')
  }
];

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

function CommandPalette({ isOpen, onClose, className = "" }: CommandPaletteProps) {
  const [selectedCommand, setSelectedCommand] = useState<Command | null>(null);
  
  // Handle command execution
  const handleCommandClick = useCallback((command: Command) => {
    setSelectedCommand(command);
    command.action();
    setTimeout(onClose, 100); // Brief delay for visual feedback
  }, [onClose]);

  // Convert commands to search results
  const commandResults: SearchResult[] = SAMPLE_COMMANDS.map(cmd => ({
    id: cmd.id,
    type: 'action',
    title: cmd.title,
    subtitle: cmd.subtitle,
    description: cmd.description,
    icon: cmd.icon,
    tags: [cmd.category, ...(cmd.shortcut ? ['shortcut'] : [])],
    score: 1.0
  }));

  // Handle search result click
  const handleResultClick = useCallback((result: SearchResult) => {
    const command = SAMPLE_COMMANDS.find(cmd => cmd.id === result.id);
    if (command) {
      handleCommandClick(command);
    }
  }, [handleCommandClick]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Command Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={`
              fixed top-20 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-2xl mx-4
              ${className}
            `}
          >
            <div className="bg-surface/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 flex items-center justify-center text-brand">
                    ⌘
                  </div>
                  <h2 className="text-lg font-semibold text-white">Command Palette</h2>
                  <div className="ml-auto text-xs text-gray-500">
                    Type to search commands
                  </div>
                </div>
              </div>

              {/* Search */}
              <div className="p-4">
                <SmartSearch
                  placeholder="Search commands and actions..."
                  maxResults={8}
                  showCategories={false}
                  showRecentSearches={false}
                  autoFocus={true}
                  onResultClick={handleResultClick}
                />
              </div>

              {/* Quick Commands */}
              <div className="p-4 pt-0">
                <h3 className="text-sm font-medium text-gray-400 mb-3">Quick Commands</h3>
                <div className="grid grid-cols-1 gap-1">
                  {SAMPLE_COMMANDS.slice(0, 5).map((command, index) => (
                    <motion.button
                      key={command.id}
                      onClick={() => handleCommandClick(command)}
                      className={`
                        w-full p-3 rounded-lg text-left transition-all duration-200
                        hover:bg-white/5 focus:bg-brand/10 focus:outline-none focus:ring-2 focus:ring-brand/50
                        ${selectedCommand?.id === command.id ? 'bg-brand/10' : ''}
                      `}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 flex items-center justify-center text-lg">
                          {command.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="text-white font-medium">{command.title}</h4>
                            {command.shortcut && (
                              <span className="text-xs text-gray-500 font-mono bg-white/5 px-2 py-1 rounded">
                                {command.shortcut}
                              </span>
                            )}
                          </div>
                          {command.subtitle && (
                            <p className="text-sm text-gray-400 mt-1">
                              {command.subtitle}
                            </p>
                          )}
                        </div>
                        <div className="text-gray-400">
                          →
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 bg-white/5 border-t border-white/10">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-4">
                    <span>↑↓ Navigate</span>
                    <span>↵ Execute</span>
                    <span>⎋ Close</span>
                  </div>
                  <div>
                    Press <span className="font-mono bg-white/10 px-1 rounded">⌘K</span> anytime
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

interface SmartSearchInterfaceProps {
  className?: string;
}

export function SmartSearchInterface({ className = "" }: SmartSearchInterfaceProps) {
  const { preferences, markDayComplete } = useStore();
  
  // Component state
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [searchStats, setSearchStats] = useState({
    totalSearches: 0,
    resultsClicked: 0,
    averageQueryLength: 0
  });

  // Handle search changes
  const handleSearchChange = useCallback((query: string) => {
    setSearchStats(prev => ({
      ...prev,
      totalSearches: prev.totalSearches + 1,
      averageQueryLength: (prev.averageQueryLength + query.length) / 2
    }));
  }, []);

  // Handle result clicks
  const handleResultClick = useCallback((result: SearchResult) => {
    setSearchStats(prev => ({
      ...prev,
      resultsClicked: prev.resultsClicked + 1
    }));
    
    // Mark day complete on first interaction
    markDayComplete(6);
    
    console.log('Result clicked:', result);
    // Handle navigation or actions based on result type
  }, [markDayComplete]);

  // Global keyboard shortcut
  useKeyboardShortcut('cmd+k', () => setShowCommandPalette(true));

  return (
    <div className={`max-w-6xl mx-auto ${className}`}>
      <FadeIn className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-brand/10 text-brand px-4 py-2 rounded-full text-sm font-medium mb-6">
          🔍 Day 6
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">
          Smart Search Interface
        </h1>
        <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
          Advanced search with real-time filtering, category organization, keyboard shortcuts, 
          and intelligent result ranking. Includes command palette for quick actions.
        </p>
      </FadeIn>

      {/* Main Search */}
      <ScaleIn delay={0.2} className="mb-12">
        <div className="text-center mb-8">
          <SmartSearch
            placeholder="Search projects, people, files, and more..."
            maxResults={8}
            showCategories={true}
            showRecentSearches={true}
            autoFocus={false}
            onResultClick={handleResultClick}
            onSearchChange={handleSearchChange}
          />
        </div>
      </ScaleIn>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <ScaleIn delay={0.4} className="bg-surface/10 rounded-xl border border-white/10 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-brand/20 rounded-lg flex items-center justify-center">
              <span className="text-brand text-lg">🎯</span>
            </div>
            <div>
              <h3 className="text-white font-medium">Smart Filtering</h3>
              <p className="text-gray-400 text-sm">Category-based organization</p>
            </div>
          </div>
          <p className="text-gray-300 text-sm">
            Automatically categorizes results by type: people, projects, documents, messages, and files.
          </p>
        </ScaleIn>

        <ScaleIn delay={0.5} className="bg-surface/10 rounded-xl border border-white/10 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-ok/20 rounded-lg flex items-center justify-center">
              <span className="text-ok text-lg">⚡</span>
            </div>
            <div>
              <h3 className="text-white font-medium">Real-time Results</h3>
              <p className="text-gray-400 text-sm">Instant search feedback</p>
            </div>
          </div>
          <p className="text-gray-300 text-sm">
            Search results update in real-time as you type, with intelligent ranking and highlighting.
          </p>
        </ScaleIn>

        <ScaleIn delay={0.6} className="bg-surface/10 rounded-xl border border-white/10 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-warning/20 rounded-lg flex items-center justify-center">
              <span className="text-warning text-lg">⌨️</span>
            </div>
            <div>
              <h3 className="text-white font-medium">Keyboard Navigation</h3>
              <p className="text-gray-400 text-sm">Full accessibility support</p>
            </div>
          </div>
          <p className="text-gray-300 text-sm">
            Navigate with arrow keys, select with Enter, and use shortcuts for power user workflows.
          </p>
        </ScaleIn>
      </div>

      {/* Command Palette Trigger */}
      <ScaleIn delay={0.8} className="text-center mb-12">
        <div className="bg-surface/10 rounded-xl border border-white/10 p-8">
          <h2 className="text-2xl font-bold text-white mb-4">Command Palette</h2>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Access powerful commands and actions instantly. Navigate, create, edit, and configure with ease.
          </p>
          <motion.button
            onClick={() => setShowCommandPalette(true)}
            className="inline-flex items-center gap-3 bg-brand hover:bg-brand/80 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>⌘</span>
            <span>Open Command Palette</span>
            <span className="text-sm opacity-70">⌘K</span>
          </motion.button>
        </div>
      </ScaleIn>

      {/* Search Statistics */}
      <ScaleIn delay={1.0} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-surface/10 rounded-lg border border-white/10 p-6 text-center">
          <div className="text-2xl font-bold text-white mb-2">
            {searchStats.totalSearches}
          </div>
          <p className="text-gray-400 text-sm">Total Searches</p>
        </div>
        
        <div className="bg-surface/10 rounded-lg border border-white/10 p-6 text-center">
          <div className="text-2xl font-bold text-white mb-2">
            {searchStats.resultsClicked}
          </div>
          <p className="text-gray-400 text-sm">Results Clicked</p>
        </div>
        
        <div className="bg-surface/10 rounded-lg border border-white/10 p-6 text-center">
          <div className="text-2xl font-bold text-white mb-2">
            {Math.round(searchStats.averageQueryLength)}
          </div>
          <p className="text-gray-400 text-sm">Avg. Query Length</p>
        </div>
      </ScaleIn>

      {/* Instructions */}
      <ScaleIn delay={1.2} className="text-center">
        <div className="bg-brand/5 border border-brand/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">How to Use</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-400">
            <div>
              • <strong className="text-white">Type to search</strong> across all content types
            </div>
            <div>
              • <strong className="text-white">Use categories</strong> to filter by content type
            </div>
            <div>
              • <strong className="text-white">Arrow keys</strong> to navigate results
            </div>
            <div>
              • <strong className="text-white">Press ⌘K</strong> to open command palette
            </div>
          </div>
        </div>
      </ScaleIn>

      {/* Command Palette */}
      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
      />
    </div>
  );
}

// Custom hook for keyboard shortcuts
function useKeyboardShortcut(shortcut: string, callback: () => void) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const keys = shortcut.toLowerCase().split('+');
    const isCmd = keys.includes('cmd') && (e.metaKey || e.ctrlKey);
    const key = keys[keys.length - 1];
    
    if (isCmd && e.key.toLowerCase() === key) {
      e.preventDefault();
      callback();
    }
  }, [shortcut, callback]);

  // Use useEffect instead of useState for event listener
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
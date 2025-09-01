"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, useDragControls } from "framer-motion";
import { SPRING, DURATIONS, FadeIn, ScaleIn } from "../motion/Primitives";
import { useStore } from "../../lib/store";
import { 
  ARIA_LABELS, 
  ScreenReader, 
  handleKeyboardNavigation 
} from "../../lib/a11y";

// File types and data
export interface FileItem {
  id: string;
  name: string;
  type: 'image' | 'document' | 'video' | 'audio' | 'code';
  size: string;
  preview: string; // emoji or thumbnail
  content?: string;
  dateAdded: string;
  color: string;
}

const FILE_TYPES = {
  image: { icon: '🖼️', color: '#22C55E', label: 'Image' },
  document: { icon: '📄', color: '#3B82F6', label: 'Document' },
  video: { icon: '🎬', color: '#EF4444', label: 'Video' },
  audio: { icon: '🎵', color: '#8B5CF6', label: 'Audio' },
  code: { icon: '💻', color: '#F59E0B', label: 'Code' }
} as const;

const SAMPLE_FILES: FileItem[] = [
  {
    id: 'design-mockup',
    name: 'Design Mockup.fig',
    type: 'image',
    size: '2.4 MB',
    preview: '🎨',
    content: 'User interface mockups for the new dashboard design',
    dateAdded: '2024-08-15',
    color: FILE_TYPES.image.color
  },
  {
    id: 'project-brief',
    name: 'Project Brief.pdf',
    type: 'document',
    size: '856 KB',
    preview: '📋',
    content: 'Comprehensive project requirements and specifications',
    dateAdded: '2024-08-14',
    color: FILE_TYPES.document.color
  },
  {
    id: 'demo-video',
    name: 'Demo Video.mp4',
    type: 'video',
    size: '12.3 MB',
    preview: '📹',
    content: 'Product demonstration and feature walkthrough',
    dateAdded: '2024-08-13',
    color: FILE_TYPES.video.color
  },
  {
    id: 'brand-guidelines',
    name: 'Brand Guidelines.pdf',
    type: 'document',
    size: '1.2 MB',
    preview: '🎯',
    content: 'Brand identity guidelines and usage instructions',
    dateAdded: '2024-08-12',
    color: FILE_TYPES.document.color
  },
  {
    id: 'source-code',
    name: 'Source Code.zip',
    type: 'code',
    size: '5.7 MB',
    preview: '⚡',
    content: 'Complete source code for the application',
    dateAdded: '2024-08-11',
    color: FILE_TYPES.code.color
  }
];

interface PaperStackFolderProps {
  files: FileItem[];
  onFileAdd: (file: FileItem) => void;
  onFileRemove: (fileId: string) => void;
  onFileSelect: (file: FileItem | null) => void;
  selectedFile: FileItem | null;
  className?: string;
}

function PaperStackFolder({
  files,
  onFileAdd,
  onFileRemove,
  onFileSelect,
  selectedFile,
  className = ""
}: PaperStackFolderProps) {
  // Component state
  const [isHovered, setIsHovered] = useState(false);
  const [isPeeking, setIsPeeking] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  
  // Refs
  const folderRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();
  
  // Motion values for folder interactions
  const flapRotation = useMotionValue(0);
  const stackHeight = useMotionValue(0);
  const peekProgress = useMotionValue(0);
  
  // Transform values
  const flapRotationDeg = useTransform(flapRotation, [0, 1], [0, -15]);
  const stackHeightPx = useTransform(stackHeight, [0, 1], [0, files.length * 4]);
  const peekOffset = useTransform(peekProgress, [0, 1], [0, 120]);
  
  // Folder states
  const folderState = files.length === 0 ? 'empty' : isPeeking ? 'previewing' : 'full';
  
  // Breathing animation for folder flap
  useEffect(() => {
    if (isHovered && !isPeeking) {
      const interval = setInterval(() => {
        flapRotation.set(1);
        setTimeout(() => flapRotation.set(0), 300);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isHovered, isPeeking, flapRotation]);
  
  // Handle folder peek (drag interaction)
  const handlePeekStart = useCallback(() => {
    setIsPeeking(true);
    peekProgress.set(1);
    ScreenReader.announce('Folder opened, showing contents', 'polite');
  }, [peekProgress]);
  
  const handlePeekEnd = useCallback(() => {
    setIsClosing(true);
    setIsPeeking(false);
    
    // Compression animation with soft thump
    peekProgress.set(0);
    stackHeight.set(0.5);
    
    // Reset after animation
    setTimeout(() => {
      setIsClosing(false);
      stackHeight.set(0);
    }, 400);
    
    ScreenReader.announce('Folder closed', 'polite');
  }, [peekProgress, stackHeight]);
  
  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);
  
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    // Mock file creation from drop
    const mockFile: FileItem = {
      id: `file-${Date.now()}`,
      name: 'Dropped File.pdf',
      type: 'document',
      size: Math.floor(Math.random() * 5000) + 'KB',
      preview: '📄',
      content: 'This is a mock file added via drag and drop',
      dateAdded: new Date().toISOString().split('T')[0],
      color: FILE_TYPES.document.color
    };
    
    onFileAdd(mockFile);
    ScreenReader.announce(`Added ${mockFile.name} to folder`, 'polite');
  }, [onFileAdd]);
  
  // File selection handler
  const handleFileClick = useCallback((file: FileItem) => {
    onFileSelect(selectedFile?.id === file.id ? null : file);
  }, [selectedFile, onFileSelect]);
  
  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isPeeking) {
        if (e.key === 'Escape') {
          handlePeekEnd();
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isPeeking, handlePeekEnd]);

  return (
    <div className={`relative ${className}`}>
      {/* Folder Container */}
      <motion.div
        ref={folderRef}
        className="relative w-80 mx-auto cursor-pointer select-none"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={isPeeking ? handlePeekEnd : handlePeekStart}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        animate={{
          y: isClosing ? [0, -4, 0] : 0,
        }}
        transition={{
          y: { duration: 0.4, ease: [0.4, 0.0, 0.2, 1] }
        }}
      >
        {/* Folder Base */}
        <motion.div
          className="relative bg-gradient-to-br from-yellow-100 to-yellow-200 border-2 border-yellow-300 rounded-lg shadow-lg overflow-hidden"
          style={{
            height: 200,
            transformStyle: 'preserve-3d'
          }}
          animate={{
            boxShadow: isDragOver 
              ? '0 20px 40px rgba(0,0,0,0.3), 0 0 20px rgba(124, 58, 237, 0.5)'
              : isHovered 
                ? '0 15px 30px rgba(0,0,0,0.2)'
                : '0 8px 16px rgba(0,0,0,0.1)'
          }}
        >
          {/* Folder Tab/Flap */}
          <motion.div
            className="absolute -top-3 left-8 w-16 h-6 bg-gradient-to-b from-yellow-200 to-yellow-300 border-2 border-yellow-300 border-b-0 rounded-t-lg origin-bottom"
            style={{
              rotateX: flapRotationDeg,
              zIndex: 10
            }}
            animate={{
              rotateX: isDragOver ? -25 : undefined
            }}
            transition={SPRING}
          />
          
          {/* Folder Interior */}
          <div className="absolute inset-2 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded border border-yellow-200 overflow-hidden">
            {/* Empty State */}
            {folderState === 'empty' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-full text-gray-500"
              >
                <motion.div
                  animate={{ 
                    scale: isDragOver ? [1, 1.1, 1] : 1,
                    rotate: isDragOver ? [0, -5, 5, 0] : 0
                  }}
                  transition={{ duration: 0.5, repeat: isDragOver ? Infinity : 0 }}
                  className="text-6xl mb-4"
                >
                  📁
                </motion.div>
                <p className="text-sm font-medium">Empty Folder</p>
                <p className="text-xs mt-1 text-center px-4">
                  {isDragOver ? 'Drop files here' : 'Drag files here or click to browse'}
                </p>
              </motion.div>
            )}
            
            {/* File Stack - Collapsed View */}
            {folderState === 'full' && !isPeeking && (
              <motion.div
                className="relative p-4 h-full"
                style={{ perspective: 1000 }}
              >
                <div className="relative">
                  {/* Stack indicator papers */}
                  {files.slice(0, 3).map((file, index) => (
                    <motion.div
                      key={file.id}
                      className="absolute inset-0 bg-white border border-gray-200 rounded shadow-sm"
                      style={{
                        zIndex: 3 - index,
                        rotateZ: (index - 1) * 2,
                        y: index * 3,
                        x: index * 2,
                      }}
                      animate={{
                        y: stackHeightPx.get() + index * 3,
                      }}
                    />
                  ))}
                  
                  {/* Top file preview */}
                  <motion.div className="relative bg-white border-2 border-gray-300 rounded p-4 shadow-md h-32">
                    <div className="flex items-start gap-3">
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl flex-shrink-0 shadow-sm"
                        style={{ backgroundColor: files[0]?.color + '20' }}
                      >
                        {files[0]?.preview}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">
                          {files[0]?.name}
                        </h4>
                        <p className="text-sm text-gray-500 mt-1">
                          {files[0]?.size} • {FILE_TYPES[files[0]?.type as keyof typeof FILE_TYPES]?.label}
                        </p>
                        <p className="text-xs text-gray-400 mt-2 line-clamp-2">
                          {files[0]?.content}
                        </p>
                      </div>
                    </div>
                    
                    {files.length > 1 && (
                      <div className="absolute bottom-2 right-2 bg-brand/10 text-brand px-2 py-1 rounded text-xs font-medium">
                        +{files.length - 1} more
                      </div>
                    )}
                  </motion.div>
                </div>
              </motion.div>
            )}
            
            {/* File Stack - Peeking View */}
            {folderState === 'previewing' && isPeeking && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 p-2 overflow-hidden"
              >
                <div className="h-full overflow-y-auto space-y-2">
                  {files.map((file, index) => (
                    <motion.div
                      key={file.id}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className={`
                        bg-white border rounded-lg p-3 cursor-pointer transition-all hover:shadow-md
                        ${selectedFile?.id === file.id ? 'ring-2 ring-brand border-brand' : 'border-gray-200'}
                      `}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFileClick(file);
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-8 h-8 rounded flex items-center justify-center text-sm flex-shrink-0"
                          style={{ backgroundColor: file.color + '20' }}
                        >
                          {file.preview}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="font-medium text-gray-900 text-sm truncate">
                            {file.name}
                          </h5>
                          <p className="text-xs text-gray-500">
                            {file.size}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onFileRemove(file.id);
                          }}
                          className="text-gray-400 hover:text-red-500 text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
            
            {/* Drag Over Overlay */}
            <AnimatePresence>
              {isDragOver && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-brand/10 border-2 border-dashed border-brand rounded flex items-center justify-center"
                >
                  <div className="text-center">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="text-4xl mb-2"
                    >
                      📥
                    </motion.div>
                    <p className="text-brand font-medium">Drop to add files</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
        
        {/* Interaction Hints */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: isHovered && !isPeeking ? 1 : 0,
            y: isHovered && !isPeeking ? 0 : 10
          }}
          className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 text-center whitespace-nowrap"
        >
          {folderState === 'empty' ? 'Click or drag files' : 'Click to peek inside'}
        </motion.div>
      </motion.div>
    </div>
  );
}

interface InteractiveFolderProps {
  className?: string;
}

export function InteractiveFolder({ className = "" }: InteractiveFolderProps) {
  const { markDayComplete, preferences } = useStore();
  
  // Component state
  const [files, setFiles] = useState<FileItem[]>(SAMPLE_FILES.slice(0, 3));
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [folderCount, setFolderCount] = useState(1);

  // Handle file operations
  const handleFileAdd = useCallback((file: FileItem) => {
    setFiles(prev => [file, ...prev]);
    markDayComplete(4);
    ScreenReader.announce(`Added ${file.name} to folder`, 'polite');
  }, [markDayComplete]);

  const handleFileRemove = useCallback((fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
    if (selectedFile?.id === fileId) {
      setSelectedFile(null);
    }
    ScreenReader.announce('File removed from folder', 'polite');
  }, [selectedFile]);

  const handleFileSelect = useCallback((file: FileItem | null) => {
    setSelectedFile(file);
    if (file) {
      ScreenReader.announce(`Selected ${file.name}`, 'polite');
    }
  }, []);

  // Add more sample files
  const addSampleFile = useCallback(() => {
    const availableFiles = SAMPLE_FILES.filter(f => !files.some(existing => existing.id === f.id));
    if (availableFiles.length > 0) {
      const randomFile = availableFiles[Math.floor(Math.random() * availableFiles.length)];
      handleFileAdd(randomFile);
    }
  }, [files, handleFileAdd]);

  // Clear all files
  const clearFolder = useCallback(() => {
    setFiles([]);
    setSelectedFile(null);
    ScreenReader.announce('Folder cleared', 'polite');
  }, []);

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      <FadeIn className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-brand/10 text-brand px-4 py-2 rounded-full text-sm font-medium mb-6">
          📁 Day 4
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">
          Interactive Folder ("Paper-Stack Folder")
        </h1>
        <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
          A folder that breathes on hover, opens to peek at contents, accepts drag & drop files, 
          and closes with a satisfying compression animation.
        </p>
      </FadeIn>

      {/* Main Folder Demo */}
      <div className="mb-12">
        <PaperStackFolder
          files={files}
          onFileAdd={handleFileAdd}
          onFileRemove={handleFileRemove}
          onFileSelect={handleFileSelect}
          selectedFile={selectedFile}
        />
      </div>

      {/* Selected File Details */}
      <AnimatePresence>
        {selectedFile && (
          <FadeIn className="mb-12">
            <div className="bg-surface/10 rounded-2xl border border-white/10 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span className="text-brand">👁️</span>
                File Preview
              </h3>
              
              <div className="bg-white/5 rounded-lg p-4 flex items-start gap-4">
                <div 
                  className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl flex-shrink-0 shadow-sm"
                  style={{ backgroundColor: selectedFile.color + '20' }}
                >
                  {selectedFile.preview}
                </div>
                <div className="flex-1">
                  <h4 className="text-xl font-bold text-white mb-2">
                    {selectedFile.name}
                  </h4>
                  <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                    <span>{selectedFile.size}</span>
                    <span>•</span>
                    <span>{FILE_TYPES[selectedFile.type]?.label}</span>
                    <span>•</span>
                    <span>{selectedFile.dateAdded}</span>
                  </div>
                  <p className="text-gray-300">
                    {selectedFile.content}
                  </p>
                </div>
              </div>
            </div>
          </FadeIn>
        )}
      </AnimatePresence>

      {/* Controls */}
      <ScaleIn delay={0.3} className="text-center mb-12">
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={addSampleFile}
            disabled={files.length >= SAMPLE_FILES.length}
            className="px-6 py-3 bg-brand hover:bg-brand/80 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
          >
            Add Sample File
          </button>
          
          <button
            onClick={clearFolder}
            disabled={files.length === 0}
            className="px-6 py-3 bg-surface/20 hover:bg-surface/30 disabled:bg-gray-800 disabled:cursor-not-allowed text-white rounded-lg font-medium border border-white/10 transition-colors"
          >
            Clear Folder
          </button>
          
          <div className="px-4 py-2 bg-white/5 rounded-lg text-sm text-gray-400">
            {files.length} / {SAMPLE_FILES.length} files
          </div>
        </div>
      </ScaleIn>

      {/* Feature Breakdown */}
      <ScaleIn delay={0.4} className="text-center">
        <div className="bg-brand/5 border border-brand/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Folder Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-400">
            <div>
              • <strong className="text-white">Breathing Flap</strong> - Subtle hinge rotation on hover
            </div>
            <div>
              • <strong className="text-white">Peek Interaction</strong> - Click/drag to view contents
            </div>
            <div>
              • <strong className="text-white">Soft Thump</strong> - Compression animation when closing
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-400 mt-2">
            <div>
              • <strong className="text-white">Drag & Drop</strong> - Drop files to add them
            </div>
            <div>
              • <strong className="text-white">Smart States</strong> - Empty, previewing, and full modes
            </div>
            <div>
              • <strong className="text-white">File Management</strong> - Add, remove, and select files
            </div>
          </div>
        </div>
      </ScaleIn>
    </div>
  );
}
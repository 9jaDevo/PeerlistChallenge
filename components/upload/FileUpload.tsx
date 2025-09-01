"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence, useSpring } from "framer-motion";
import { SPRING, DURATIONS, FadeIn, ScaleIn } from "../motion/Primitives";
import { useStore } from "../../lib/store";
import { 
  ARIA_LABELS, 
  ScreenReader, 
  handleKeyboardNavigation 
} from "../../lib/a11y";

// File upload types
export type UploadStatus = 'idle' | 'dragging' | 'uploading' | 'success' | 'error';
export type FileType = 'image' | 'document' | 'video' | 'audio' | 'other';

export interface UploadedFile {
  id: string;
  file: File;
  type: FileType;
  status: UploadStatus;
  progress: number;
  error?: string;
  preview?: string;
}

interface FileUploadProps {
  acceptedTypes?: string[];
  maxFileSize?: number; // in MB
  maxFiles?: number;
  onUpload?: (files: UploadedFile[]) => void;
  onComplete?: (files: UploadedFile[]) => void;
  className?: string;
}

export function FileUpload({
  acceptedTypes = ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.doc', '.docx', '.txt'],
  maxFileSize = 10, // MB
  maxFiles = 5,
  onUpload,
  onComplete,
  className = ""
}: FileUploadProps) {
  const { markDayComplete, preferences } = useStore();
  
  // Upload state
  const [dragStatus, setDragStatus] = useState<UploadStatus>('idle');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Get file type from file
  const getFileType = (file: File): FileType => {
    const type = file.type.toLowerCase();
    if (type.startsWith('image/')) return 'image';
    if (type.startsWith('video/')) return 'video';
    if (type.startsWith('audio/')) return 'audio';
    if (type.includes('pdf') || type.includes('document') || type.includes('text')) return 'document';
    return 'other';
  };

  // Get file type icon
  const getFileIcon = (type: FileType): string => {
    switch (type) {
      case 'image': return '🖼️';
      case 'video': return '🎥';
      case 'audio': return '🎵';
      case 'document': return '📄';
      default: return '📎';
    }
  };

  // Validate file
  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxFileSize * 1024 * 1024) {
      return `File size exceeds ${maxFileSize}MB limit`;
    }
    
    // Check file type
    const extension = `.${file.name.split('.').pop()?.toLowerCase()}`;
    if (!acceptedTypes.includes(extension)) {
      return `File type ${extension} not supported`;
    }
    
    return null;
  };

  // Create file preview
  const createFilePreview = (file: File): Promise<string | undefined> => {
    return new Promise((resolve) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = () => resolve(undefined);
        reader.readAsDataURL(file);
      } else {
        resolve(undefined);
      }
    });
  };

  // Simulate file upload with progress
  const simulateUpload = async (uploadedFile: UploadedFile): Promise<void> => {
    return new Promise((resolve, reject) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          
          // Simulate occasional errors (10% chance)
          if (Math.random() < 0.1) {
            setUploadedFiles(prev => prev.map(f => 
              f.id === uploadedFile.id 
                ? { ...f, status: 'error', error: 'Upload failed. Please try again.' }
                : f
            ));
            reject(new Error('Upload failed'));
          } else {
            setUploadedFiles(prev => prev.map(f => 
              f.id === uploadedFile.id 
                ? { ...f, status: 'success', progress: 100 }
                : f
            ));
            resolve();
          }
        } else {
          setUploadedFiles(prev => prev.map(f => 
            f.id === uploadedFile.id ? { ...f, progress } : f
          ));
        }
      }, 100 + Math.random() * 200);
    });
  };

  // Process files
  const processFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    
    // Check max files limit
    if (uploadedFiles.length + fileArray.length > maxFiles) {
      ScreenReader.announce(`Cannot upload more than ${maxFiles} files`, 'assertive');
      return;
    }

    setIsUploading(true);
    const newFiles: UploadedFile[] = [];

    // Process each file
    for (const file of fileArray) {
      const error = validateFile(file);
      const preview = await createFilePreview(file);
      
      const uploadedFile: UploadedFile = {
        id: crypto.randomUUID(),
        file,
        type: getFileType(file),
        status: error ? 'error' : 'uploading',
        progress: 0,
        error: error || undefined,
        preview
      };
      
      newFiles.push(uploadedFile);
    }

    // Add files to state
    setUploadedFiles(prev => [...prev, ...newFiles]);
    
    // Start uploads for valid files
    const validFiles = newFiles.filter(f => !f.error);
    onUpload?.(validFiles);

    try {
      // Upload files concurrently
      await Promise.allSettled(
        validFiles.map(file => simulateUpload(file))
      );
      
      // Mark day complete if any uploads succeeded
      const successfulUploads = uploadedFiles.filter(f => f.status === 'success');
      if (successfulUploads.length > 0) {
        markDayComplete(3);
      }
      
      onComplete?.(uploadedFiles);
      ScreenReader.announce(`${validFiles.length} files uploaded successfully`, 'polite');
    } catch (error) {
      ScreenReader.announce('Some uploads failed', 'assertive');
    } finally {
      setIsUploading(false);
    }
  }, [uploadedFiles, maxFiles, onUpload, onComplete, markDayComplete]);

  // Handle file input change
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
      // Reset input
      e.target.value = '';
    }
  };

  // Handle drag events
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragStatus('dragging');
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    // Only set to idle if leaving the drop zone entirely
    if (!dropZoneRef.current?.contains(e.relatedTarget as Node)) {
      setDragStatus('idle');
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragStatus('idle');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFiles(files);
      ScreenReader.announce(`${files.length} files dropped for upload`, 'polite');
    }
  }, [processFiles]);

  // Remove file
  const removeFile = useCallback((id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
    ScreenReader.announce('File removed', 'polite');
  }, []);

  // Retry upload
  const retryUpload = useCallback(async (id: string) => {
    const file = uploadedFiles.find(f => f.id === id);
    if (!file) return;

    setUploadedFiles(prev => prev.map(f => 
      f.id === id ? { ...f, status: 'uploading', progress: 0, error: undefined } : f
    ));

    try {
      await simulateUpload(file);
      ScreenReader.announce('File uploaded successfully', 'polite');
    } catch (error) {
      ScreenReader.announce('Upload failed again', 'assertive');
    }
  }, [uploadedFiles]);

  // Clear all files
  const clearAll = useCallback(() => {
    setUploadedFiles([]);
    ScreenReader.announce('All files cleared', 'polite');
  }, []);

  // Keyboard handlers
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    handleKeyboardNavigation(e, {
      onEnter: () => fileInputRef.current?.click(),
      onSpace: () => fileInputRef.current?.click(),
      preventDefault: ['Enter', 'Space'].includes(e.key)
    });
  }, []);

  return (
    <div className={`relative ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">
            File Upload
          </h3>
          <p className="text-sm text-gray-400">
            Drag & drop files or click to browse
          </p>
        </div>
        
        {uploadedFiles.length > 0 && (
          <button
            onClick={clearAll}
            disabled={isUploading}
            className="px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-surface/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Drop Zone */}
      <motion.div
        ref={dropZoneRef}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onKeyDown={handleKeyDown}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer
          transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand
          ${dragStatus === 'dragging' 
            ? 'border-brand bg-brand/10 scale-102' 
            : 'border-gray-600 hover:border-gray-500 hover:bg-surface/20'
          }
        `}
        tabIndex={0}
        role="button"
        aria-label="Click to select files or drag and drop files here"
        whileHover={{ scale: dragStatus === 'dragging' ? 1.02 : 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        {/* Background animation */}
        <AnimatePresence>
          {dragStatus === 'dragging' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute inset-0 bg-brand/5 rounded-2xl"
            />
          )}
        </AnimatePresence>

        {/* Upload icon and text */}
        <motion.div
          animate={{
            y: dragStatus === 'dragging' ? -8 : 0,
            scale: dragStatus === 'dragging' ? 1.1 : 1
          }}
          transition={SPRING}
        >
          <div className="text-5xl mb-4">
            {dragStatus === 'dragging' ? '⬇️' : '📁'}
          </div>
          
          <h4 className="text-lg font-medium text-white mb-2">
            {dragStatus === 'dragging' ? 'Drop files here' : 'Choose files to upload'}
          </h4>
          
          <p className="text-gray-400 mb-4">
            {dragStatus === 'dragging' 
              ? 'Release to start uploading' 
              : 'Or drag and drop files here'
            }
          </p>
          
          <div className="text-xs text-gray-500 space-y-1">
            <p>Accepted: {acceptedTypes.join(', ')}</p>
            <p>Max size: {maxFileSize}MB • Max files: {maxFiles}</p>
          </div>
        </motion.div>
        
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          className="hidden"
          aria-hidden="true"
        />
      </motion.div>

      {/* File List */}
      <AnimatePresence mode="popLayout">
        {uploadedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 space-y-3"
          >
            <h4 className="text-sm font-medium text-gray-300">
              Uploaded Files ({uploadedFiles.length}/{maxFiles})
            </h4>
            
            <div className="space-y-2">
              {uploadedFiles.map((file, index) => (
                <FileItem
                  key={file.id}
                  file={file}
                  index={index}
                  onRemove={() => removeFile(file.id)}
                  onRetry={() => retryUpload(file.id)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Individual File Item Component
interface FileItemProps {
  file: UploadedFile;
  index: number;
  onRemove: () => void;
  onRetry: () => void;
}

function FileItem({ file, index, onRemove, onRetry }: FileItemProps) {
  // Get file type icon
  const getFileIcon = (type: FileType): string => {
    switch (type) {
      case 'image': return '🖼️';
      case 'video': return '🎥';
      case 'audio': return '🎵';
      case 'document': return '📄';
      default: return '📎';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: -100, scale: 0.95 }}
      transition={{ ...SPRING, delay: index * 0.1 }}
      className={`
        flex items-center gap-4 p-4 rounded-lg border
        ${file.status === 'success' 
          ? 'bg-ok/10 border-ok/30' 
          : file.status === 'error'
          ? 'bg-danger/10 border-danger/30'
          : 'bg-surface/20 border-white/10'
        }
      `}
    >
      {/* File Icon/Preview */}
      <div className="flex-shrink-0">
        {file.preview ? (
          <img
            src={file.preview}
            alt={file.file.name}
            className="w-12 h-12 object-cover rounded-lg"
          />
        ) : (
          <div className="w-12 h-12 bg-surface/50 rounded-lg flex items-center justify-center text-xl">
            {getFileIcon(file.type)}
          </div>
        )}
      </div>

      {/* File Info */}
      <div className="flex-1 min-w-0">
        <h5 className="text-sm font-medium text-white truncate">
          {file.file.name}
        </h5>
        <p className="text-xs text-gray-400">
          {(file.file.size / 1024 / 1024).toFixed(1)} MB • {file.type}
        </p>
        
        {/* Progress Bar */}
        {file.status === 'uploading' && (
          <div className="mt-2 w-full bg-gray-700 rounded-full h-1.5 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${file.progress}%` }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="h-full bg-brand rounded-full"
            />
          </div>
        )}
        
        {/* Error Message */}
        {file.error && (
          <p className="text-xs text-danger mt-1">{file.error}</p>
        )}
      </div>

      {/* Status & Actions */}
      <div className="flex items-center gap-2">
        {file.status === 'uploading' && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-5 h-5 border-2 border-brand border-t-transparent rounded-full"
          />
        )}
        
        {file.status === 'success' && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-ok text-lg"
          >
            ✓
          </motion.div>
        )}
        
        {file.status === 'error' && (
          <button
            onClick={onRetry}
            className="text-xs px-2 py-1 bg-danger/20 text-danger rounded hover:bg-danger/30 transition-colors"
          >
            Retry
          </button>
        )}
        
        <button
          onClick={onRemove}
          className="text-gray-400 hover:text-white p-1 rounded transition-colors"
          aria-label={`Remove ${file.file.name}`}
        >
          ✕
        </button>
      </div>
    </motion.div>
  );
}
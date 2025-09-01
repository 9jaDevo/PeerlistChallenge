"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { SPRING, DURATIONS, FadeIn, ScaleIn } from "../motion/Primitives";
import { useStore } from "../../lib/store";
import { 
  ARIA_LABELS, 
  ScreenReader, 
  handleKeyboardNavigation 
} from "../../lib/a11y";

// Form field types
export type FieldType = 'text' | 'email' | 'phone' | 'select' | 'textarea' | 'date' | 'number';
export type FieldStatus = 'pending' | 'active' | 'completed' | 'error';

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder: string;
  required?: boolean;
  value?: string;
  status: FieldStatus;
  helpText?: string;
  errorMessage?: string;
  options?: string[];
  icon?: string;
  validation?: (value: string) => boolean;
  format?: (value: string) => string;
}

interface ProgressiveInputStackProps {
  fields: FormField[];
  onFieldUpdate?: (fieldId: string, value: string) => void;
  onFormComplete?: (data: Record<string, string>) => void;
  autoSave?: boolean;
  className?: string;
}

export function ProgressiveInputStack({
  fields: initialFields,
  onFieldUpdate,
  onFormComplete,
  autoSave = true,
  className = ""
}: ProgressiveInputStackProps) {
  const { markDayComplete, preferences } = useStore();
  
  // Form state
  const [fields, setFields] = useState<FormField[]>(initialFields);
  const [activeFieldId, setActiveFieldId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [showAutoSaveToast, setShowAutoSaveToast] = useState(false);
  const [completedFields, setCompletedFields] = useState<Set<string>>(new Set());
  
  // Refs
  const inputRefs = useRef<Record<string, HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>>({});
  const autoSaveTimeout = useRef<NodeJS.Timeout | null>(null);

  // Progress calculation
  const progress = (completedFields.size / fields.length) * 100;
  const progressSpring = useMotionValue(0);
  const progressWidth = useTransform(progressSpring, [0, 100], ["0%", "100%"]);

  // Update progress animation
  useEffect(() => {
    progressSpring.set(progress);
  }, [progress, progressSpring]);

  // Handle field activation
  const handleFieldClick = useCallback((fieldId: string) => {
    const field = fields.find(f => f.id === fieldId);
    if (!field || field.status === 'completed') return;

    setActiveFieldId(activeFieldId === fieldId ? null : fieldId);
    
    // Focus input after animation
    setTimeout(() => {
      const input = inputRefs.current[fieldId];
      if (input) {
        input.focus();
      }
    }, 200);
    
    ScreenReader.announce(`Opened ${field.label} field`, 'polite');
  }, [activeFieldId, fields]);

  // Handle field value change
  const handleFieldChange = useCallback((fieldId: string, value: string) => {
    const field = fields.find(f => f.id === fieldId);
    if (!field) return;

    // Format value if formatter exists
    const formattedValue = field.format ? field.format(value) : value;
    
    // Update form data
    setFormData(prev => ({
      ...prev,
      [fieldId]: formattedValue
    }));

    // Update field status
    setFields(prev => prev.map(f => {
      if (f.id === fieldId) {
        const isValid = field.validation ? field.validation(formattedValue) : formattedValue.length > 0;
        return {
          ...f,
          value: formattedValue,
          status: isValid ? 'completed' : 'active'
        };
      }
      return f;
    }));

    // Update completed fields
    if (field.validation ? field.validation(formattedValue) : formattedValue.length > 0) {
      setCompletedFields(prev => new Set([...prev, fieldId]));
    } else {
      setCompletedFields(prev => {
        const newSet = new Set(prev);
        newSet.delete(fieldId);
        return newSet;
      });
    }

    onFieldUpdate?.(fieldId, formattedValue);

    // Auto-save
    if (autoSave) {
      if (autoSaveTimeout.current) {
        clearTimeout(autoSaveTimeout.current);
      }
      
      autoSaveTimeout.current = setTimeout(() => {
        setShowAutoSaveToast(true);
        setTimeout(() => setShowAutoSaveToast(false), 2000);
      }, 1000);
    }
  }, [fields, onFieldUpdate, autoSave]);

  // Handle field completion
  const handleFieldComplete = useCallback((fieldId: string) => {
    const field = fields.find(f => f.id === fieldId);
    if (!field || !field.value) return;

    // Validate field
    const isValid = field.validation ? field.validation(field.value) : field.value.length > 0;
    
    if (isValid) {
      setActiveFieldId(null);
      setCompletedFields(prev => new Set([...prev, fieldId]));
      
      // Check if form is complete
      const allCompleted = fields.every(f => 
        completedFields.has(f.id) || (f.id === fieldId && isValid)
      );
      
      if (allCompleted) {
        onFormComplete?.(formData);
        markDayComplete(5);
        ScreenReader.announce('Form completed successfully', 'assertive');
      }
      
      ScreenReader.announce(`${field.label} completed`, 'polite');
    }
  }, [fields, completedFields, formData, onFormComplete, markDayComplete]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent, fieldId: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleFieldComplete(fieldId);
    } else if (e.key === 'Escape') {
      setActiveFieldId(null);
    } else if (e.key === 'Tab' && !e.shiftKey) {
      // Auto-advance to next field
      const currentIndex = fields.findIndex(f => f.id === fieldId);
      const nextField = fields[currentIndex + 1];
      if (nextField && nextField.status !== 'completed') {
        e.preventDefault();
        setTimeout(() => handleFieldClick(nextField.id), 100);
      }
    }
  }, [fields, handleFieldClick, handleFieldComplete]);

  // Render field input based on type
  const renderFieldInput = (field: FormField) => {
    const inputProps = {
      ref: (el: any) => {
        if (el) inputRefs.current[field.id] = el;
      },
      value: field.value || '',
      onChange: (e: React.ChangeEvent<any>) => handleFieldChange(field.id, e.target.value),
      onKeyDown: (e: React.KeyboardEvent) => handleKeyDown(e, field.id),
      onBlur: () => handleFieldComplete(field.id),
      placeholder: field.placeholder,
      className: `
        w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg
        text-white placeholder-gray-400 text-sm
        focus:outline-none focus:border-brand focus:bg-white/10
        transition-all duration-200
      `,
      'aria-label': field.label,
      'aria-describedby': `${field.id}-help`,
      'aria-invalid': field.status === 'error'
    };

    switch (field.type) {
      case 'textarea':
        return <textarea {...inputProps} rows={3} />;
        
      case 'select':
        return (
          <select {...inputProps}>
            <option value="">{field.placeholder}</option>
            {field.options?.map(option => (
              <option key={option} value={option} className="bg-surface text-white">
                {option}
              </option>
            ))}
          </select>
        );
        
      case 'date':
        return <input {...inputProps} type="date" />;
        
      case 'number':
        return <input {...inputProps} type="number" />;
        
      case 'email':
        return <input {...inputProps} type="email" />;
        
      case 'phone':
        return <input {...inputProps} type="tel" />;
        
      default:
        return <input {...inputProps} type="text" />;
    }
  };

  // Render chip (collapsed state)
  const renderChip = (field: FormField) => {
    const isActive = activeFieldId === field.id;
    const isCompleted = field.status === 'completed';
    const hasError = field.status === 'error';

    return (
      <motion.div
        className={`
          relative cursor-pointer select-none
          ${isActive ? 'z-10' : 'z-0'}
        `}
        layout
        onClick={() => !isCompleted && handleFieldClick(field.id)}
        whileHover={!isCompleted ? { scale: 1.02 } : {}}
        whileTap={!isCompleted ? { scale: 0.98 } : {}}
      >
        <motion.div
          className={`
            flex items-center gap-3 px-4 py-3 rounded-lg border transition-all duration-200
            ${isCompleted 
              ? 'bg-ok/10 border-ok/30 text-ok cursor-default' 
              : isActive
                ? 'bg-brand/10 border-brand text-white'
                : hasError
                  ? 'bg-error/10 border-error/30 text-error'
                  : 'bg-white/5 border-white/20 text-gray-300 hover:border-white/40 hover:text-white'
            }
          `}
          layout
        >
          {/* Icon */}
          <div className="flex-shrink-0">
            {isCompleted ? (
              <motion.div
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                className="w-5 h-5 bg-ok rounded-full flex items-center justify-center text-white text-xs"
              >
                ✓
              </motion.div>
            ) : (
              <div className="w-5 h-5 flex items-center justify-center text-lg">
                {field.icon || '📝'}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm">
              {field.label}
              {field.required && <span className="text-error ml-1">*</span>}
            </div>
            
            {isCompleted && field.value ? (
              <div className="text-xs opacity-70 truncate mt-1">
                {field.value}
              </div>
            ) : !isActive && (
              <div className="text-xs opacity-50 truncate mt-1">
                {field.placeholder}
              </div>
            )}
          </div>

          {/* Arrow */}
          {!isCompleted && (
            <motion.div
              animate={{ rotate: isActive ? 90 : 0 }}
              transition={{ duration: 0.2 }}
              className="flex-shrink-0 text-gray-400"
            >
              →
            </motion.div>
          )}
        </motion.div>

        {/* Expanded Input */}
        <AnimatePresence>
          {isActive && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <div className="pt-4 pb-2">
                {/* Input Field */}
                <div className="mb-3">
                  {renderFieldInput(field)}
                </div>

                {/* Help Text */}
                {field.helpText && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    id={`${field.id}-help`}
                    className="text-xs text-gray-400 mb-3"
                  >
                    {field.helpText}
                  </motion.p>
                )}

                {/* Error Message */}
                <AnimatePresence>
                  {hasError && field.errorMessage && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-xs text-error mb-3"
                    >
                      {field.errorMessage}
                    </motion.p>
                  )}
                </AnimatePresence>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFieldComplete(field.id);
                    }}
                    className="px-3 py-1 bg-brand hover:bg-brand/80 text-white text-xs rounded transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Save
                  </motion.button>
                  
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveFieldId(null);
                    }}
                    className="px-3 py-1 text-gray-400 hover:text-white text-xs transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Cancel
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      <div className="flex gap-8">
        {/* Main Form */}
        <div className="flex-1">
          <FadeIn className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Complete Your Profile</h2>
            <p className="text-gray-400">
              Click on each field to expand and fill in your information. 
              Fields will collapse into chips when completed.
            </p>
          </FadeIn>

          {/* Field Stack */}
          <div className="space-y-4">
            {fields.map((field) => (
              <ScaleIn key={field.id} delay={fields.indexOf(field) * 0.1}>
                {renderChip(field)}
              </ScaleIn>
            ))}
          </div>
        </div>

        {/* Progress Rail */}
        <div className="w-64 flex-shrink-0">
          <div className="sticky top-8">
            <FadeIn delay={0.5}>
              <div className="bg-surface/10 rounded-xl border border-white/10 p-6">
                <h3 className="text-lg font-semibold text-white mb-6">Progress</h3>
                
                {/* Progress Bar */}
                <div className="relative mb-6">
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-brand to-ok rounded-full"
                      style={{ width: progressWidth }}
                      initial={{ width: "0%" }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                  </div>
                  <div className="text-center mt-2">
                    <span className="text-sm font-medium text-white">
                      {Math.round(progress)}% Complete
                    </span>
                  </div>
                </div>

                {/* Field Anchors */}
                <div className="space-y-3">
                  {fields.map((field, index) => {
                    const isCompleted = field.status === 'completed';
                    const isActive = activeFieldId === field.id;
                    
                    return (
                      <motion.div
                        key={field.id}
                        className={`
                          flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all duration-200
                          ${isActive 
                            ? 'bg-brand/20 text-brand' 
                            : isCompleted
                              ? 'text-ok'
                              : 'text-gray-400 hover:text-white hover:bg-white/5'
                          }
                        `}
                        onClick={() => handleFieldClick(field.id)}
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex-shrink-0">
                          {isCompleted ? (
                            <div className="w-6 h-6 bg-ok rounded-full flex items-center justify-center text-white text-xs">
                              ✓
                            </div>
                          ) : (
                            <div className={`
                              w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs
                              ${isActive ? 'border-brand bg-brand/20' : 'border-gray-600'}
                            `}>
                              {index + 1}
                            </div>
                          )}
                        </div>
                        <span className="text-sm font-medium">{field.label}</span>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Stats */}
                <div className="mt-6 pt-6 border-t border-white/10">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white mb-1">
                      {completedFields.size}/{fields.length}
                    </div>
                    <div className="text-xs text-gray-400">Fields completed</div>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>

      {/* Auto-save Toast */}
      <AnimatePresence>
        {showAutoSaveToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <div className="bg-ok text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
              <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center text-ok text-xs">
                ✓
              </div>
              <span className="text-sm font-medium">Auto-saved</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
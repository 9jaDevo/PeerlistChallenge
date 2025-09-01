"use client";

import { useState, useRef, useCallback, useEffect, forwardRef } from "react";
import { motion, useSpring } from "framer-motion";
import { SPRING, DURATIONS, FadeIn } from "../motion/Primitives";
import { useStore } from "../../lib/store";
import { 
  ARIA_LABELS, 
  ScreenReader, 
  handleKeyboardNavigation 
} from "../../lib/a11y";

// OTP State types
export type OtpState = 'default' | 'active' | 'correct' | 'incorrect' | 'loading';
export type OtpCell = {
  value: string;
  state: OtpState;
};

interface OtpInputProps {
  length?: number;
  onComplete?: (code: string) => void;
  onValidate?: (code: string) => Promise<boolean>;
  placeholder?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  className?: string;
}

export function OtpInput({
  length = 6,
  onComplete,
  onValidate,
  placeholder = "•",
  autoFocus = true,
  disabled = false,
  className = ""
}: OtpInputProps) {
  const { markDayComplete, preferences } = useStore();
  
  // OTP state management
  const [cells, setCells] = useState<OtpCell[]>(
    Array(length).fill(null).map(() => ({ value: '', state: 'default' as OtpState }))
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isMasked, setIsMasked] = useState(true);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<boolean | null>(null);
  
  // Refs for input management
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Get current code value
  const getCurrentCode = useCallback(() => {
    return cells.map(cell => cell.value).join('');
  }, [cells]);

  // Update cell value and state
  const updateCell = useCallback((index: number, value: string, state: OtpState = 'default') => {
    setCells(prev => prev.map((cell, i) => 
      i === index ? { ...cell, value: value.slice(-1), state } : cell
    ));
  }, []);

  // Set all cells state
  const setAllCellsState = useCallback((state: OtpState) => {
    setCells(prev => prev.map(cell => ({ ...cell, state })));
  }, []);

  // Auto-advance to next input
  const focusNext = useCallback((currentIdx: number) => {
    if (currentIdx < length - 1) {
      const nextIdx = currentIdx + 1;
      setCurrentIndex(nextIdx);
      inputRefs.current[nextIdx]?.focus();
    }
  }, [length]);

  // Move to previous input
  const focusPrevious = useCallback((currentIdx: number) => {
    if (currentIdx > 0) {
      const prevIdx = currentIdx - 1;
      setCurrentIndex(prevIdx);
      inputRefs.current[prevIdx]?.focus();
    }
  }, []);

  // Handle paste functionality
  const handlePaste = useCallback((e: React.ClipboardEvent, startIndex: number) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    
    if (pastedText.length === 0) return;

    // Clear all cells first
    setCells(prev => prev.map(() => ({ value: '', state: 'default' })));
    
    // Fill cells with pasted digits
    const newCells = Array(length).fill(null).map((_, index) => ({
      value: pastedText[index] || '',
      state: 'active' as OtpState
    }));
    
    setCells(newCells);
    
    // Focus last filled cell or next empty cell
    const lastFilledIndex = Math.min(pastedText.length - 1, length - 1);
    const focusIndex = pastedText.length >= length ? length - 1 : pastedText.length;
    setCurrentIndex(focusIndex);
    inputRefs.current[focusIndex]?.focus();
    
    // Announce paste action
    ScreenReader.announce(`${pastedText.length} digits pasted`, 'polite');
    
    // Check if complete after paste
    if (pastedText.length === length) {
      handleComplete(pastedText);
    }
  }, [length]);

  // Handle completion and validation
  const handleComplete = useCallback(async (code: string) => {
    if (code.length !== length) return;
    
    setIsComplete(true);
    setIsValidating(true);
    setAllCellsState('loading');
    
    try {
      if (onValidate) {
        const isValid = await onValidate(code);
        setValidationResult(isValid);
        setAllCellsState(isValid ? 'correct' : 'incorrect');
        
        ScreenReader.announce(
          isValid ? 'Code verified successfully' : 'Invalid code entered',
          'assertive'
        );
        
        if (isValid) {
          markDayComplete(2);
          onComplete?.(code);
        }
      } else {
        setValidationResult(true);
        setAllCellsState('correct');
        ScreenReader.announce('Code entered successfully', 'polite');
        markDayComplete(2);
        onComplete?.(code);
      }
    } catch (error) {
      setValidationResult(false);
      setAllCellsState('incorrect');
      ScreenReader.announce('Error validating code', 'assertive');
    } finally {
      setIsValidating(false);
    }
  }, [length, onValidate, onComplete, markDayComplete]);

  // Handle input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value.replace(/\D/g, ''); // Only digits
    
    if (value.length === 0) {
      // Clear current cell
      updateCell(index, '', 'default');
      return;
    }

    // Update current cell
    updateCell(index, value, 'active');
    
    // Auto-advance if digit entered
    if (value.length === 1 && index < length - 1) {
      focusNext(index);
    }

    // Check completion
    const newCode = cells.map((cell, i) => 
      i === index ? value.slice(-1) : cell.value
    ).join('');
    
    if (newCode.length === length) {
      setTimeout(() => handleComplete(newCode), 100);
    }
  }, [cells, length, updateCell, focusNext, handleComplete]);

  // Handle key events
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    handleKeyboardNavigation(e, {
      onArrowLeft: () => focusPrevious(index),
      onArrowRight: () => focusNext(index),
      onHome: () => {
        setCurrentIndex(0);
        inputRefs.current[0]?.focus();
      },
      onEnd: () => {
        const lastIndex = length - 1;
        setCurrentIndex(lastIndex);
        inputRefs.current[lastIndex]?.focus();
      },
      preventDefault: false
    });

    // Handle backspace
    if (e.key === 'Backspace' && cells[index].value === '') {
      focusPrevious(index);
    }
    
    // Handle delete
    if (e.key === 'Delete') {
      updateCell(index, '', 'default');
    }
  }, [cells, length, focusNext, focusPrevious, updateCell]);

  // Clear all inputs
  const handleClear = useCallback(() => {
    setCells(Array(length).fill(null).map(() => ({ value: '', state: 'default' })));
    setCurrentIndex(0);
    setIsComplete(false);
    setValidationResult(null);
    inputRefs.current[0]?.focus();
    ScreenReader.announce('All fields cleared', 'polite');
  }, [length]);

  // Auto-focus first input on mount
  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  return (
    <div className={`relative ${className}`}>
      {/* Header with title and controls */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Enter Verification Code
          </h3>
          <p className="text-sm text-gray-400">
            {isValidating ? 'Validating...' : 'Enter the 6-digit code sent to your device'}
          </p>
        </div>
        
        {/* Controls */}
        <div className="flex items-center gap-3">
          {/* Mask/Unmask toggle */}
          <button
            onClick={() => setIsMasked(!isMasked)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-surface/50"
            aria-label={isMasked ? 'Show digits' : 'Hide digits'}
          >
            <span className="text-xs">
              {isMasked ? '👁️' : '👁️‍🗨️'}
            </span>
            {isMasked ? 'Show' : 'Hide'}
          </button>
          
          {/* Clear button */}
          <button
            onClick={handleClear}
            disabled={disabled || isValidating}
            className="px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-surface/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Clear
          </button>
        </div>
      </div>

      {/* OTP Input Fields */}
      <div 
        ref={containerRef}
        className="flex items-center justify-center gap-3 mb-6"
        role="group"
        aria-label="One-time password input"
      >
        {cells.map((cell, index) => (
          <OtpCell
            key={index}
            ref={(el) => {inputRefs.current[index] = el}}
            value={cell.value}
            state={cell.state}
            index={index}
            total={length}
            isActive={currentIndex === index}
            isMasked={isMasked && cell.value !== ''}
            placeholder={placeholder}
            disabled={disabled || isValidating}
            onChange={(e) => handleInputChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onFocus={() => setCurrentIndex(index)}
            onPaste={(e) => handlePaste(e, index)}
          />
        ))}
      </div>

      {/* Status Message */}
      <div className="text-center min-h-[24px]">
        {isValidating && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-2 text-sm text-brand"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-4 h-4 border-2 border-brand border-t-transparent rounded-full"
            />
            Verifying code...
          </motion.div>
        )}
        
        {!isValidating && validationResult === true && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-center gap-2 text-sm text-ok"
          >
            <span className="text-base">✅</span>
            Code verified successfully!
          </motion.div>
        )}
        
        {!isValidating && validationResult === false && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-center gap-2 text-sm text-danger"
          >
            <span className="text-base">❌</span>
            Invalid code. Please try again.
          </motion.div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500 leading-relaxed max-w-md mx-auto">
          Paste a 6-digit code, use arrow keys to navigate, or type digits to auto-advance
        </p>
      </div>
    </div>
  );
}

// Individual OTP Cell Component
interface OtpCellProps {
  value: string;
  state: OtpState;
  index: number;
  total: number;
  isActive: boolean;
  isMasked: boolean;
  placeholder: string;
  disabled: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onFocus: () => void;
  onPaste: (e: React.ClipboardEvent<HTMLInputElement>) => void;
}

const OtpCell = forwardRef<HTMLInputElement, OtpCellProps>(function OtpCell({
  value,
  state,
  index,
  total,
  isActive,
  isMasked,
  placeholder,
  disabled,
  onChange,
  onKeyDown,
  onFocus,
  onPaste
}, ref) {
  // Spring animations for smooth state transitions
  const scale = useSpring(
    state === 'loading' ? 0.95 : isActive ? 1.05 : state === 'correct' ? 1.02 : 1,
    SPRING
  );
  
  const borderOpacity = useSpring(isActive ? 1 : 0.5, SPRING);

  // State-specific styling
  const getStateStyles = (state: OtpState) => {
    switch (state) {
      case 'active':
        return {
          borderColor: 'var(--brand)',
          backgroundColor: 'rgba(124, 58, 237, 0.1)',
          boxShadow: '0 0 0 1px var(--brand), 0 2px 8px rgba(124, 58, 237, 0.2)'
        };
      case 'correct':
        return {
          borderColor: 'var(--ok)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          boxShadow: '0 0 0 1px var(--ok), 0 2px 8px rgba(34, 197, 94, 0.2)'
        };
      case 'incorrect':
        return {
          borderColor: 'var(--danger)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          boxShadow: '0 0 0 1px var(--danger), 0 2px 8px rgba(239, 68, 68, 0.2)'
        };
      case 'loading':
        return {
          borderColor: 'var(--brand)',
          backgroundColor: 'rgba(124, 58, 237, 0.05)',
          boxShadow: '0 0 0 1px var(--brand)'
        };
      default:
        return {
          borderColor: 'rgba(142, 142, 160, 0.3)',
          backgroundColor: 'rgba(11, 16, 32, 0.5)',
          boxShadow: 'none'
        };
    }
  };

  const stateStyles = getStateStyles(state);
  const ariaLabel = `Digit ${index + 1} of ${total}${value ? `: ${value}` : ', empty'}`;

  return (
    <motion.div
      style={{ scale }}
      className="relative"
    >
      <motion.input
        ref={ref}
        type="text"
        inputMode="numeric"
        maxLength={1}
        value={isMasked ? (value ? '•' : '') : value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        onPaste={onPaste}
        disabled={disabled}
        placeholder={!value ? placeholder : ''}
        aria-label={ariaLabel}
        className={`
          w-14 h-14 text-xl font-mono text-center text-white
          rounded-lg border-2 transition-all duration-200
          focus:outline-none focus:ring-0
          disabled:opacity-50 disabled:cursor-not-allowed
          placeholder:text-gray-500
          ${state === 'loading' ? 'animate-pulse' : ''}
        `}
        style={{
          ...stateStyles
        }}
      />
      
      {/* Loading indicator */}
      {state === 'loading' && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <div className="w-5 h-5 border-2 border-brand border-t-transparent rounded-full" />
        </motion.div>
      )}
    </motion.div>
  );
});
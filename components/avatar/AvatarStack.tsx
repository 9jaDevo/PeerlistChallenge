"use client";

import { motion, useSpring } from "framer-motion";
import { useState, useRef, useCallback, forwardRef } from "react";
import { SPRING, DURATIONS } from "../motion/Primitives";
import { PersonaMode, usePersona, useStore } from "../../lib/store";
import { 
  ARIA_LABELS, 
  ScreenReader, 
  handleKeyboardNavigation, 
  KEYS 
} from "../../lib/a11y";

// Avatar data interface
export interface Avatar {
  id: string;
  name: string;
  role: string;
  image: string;
  color: string;
}

interface AvatarStackProps {
  avatars: Avatar[];
  className?: string;
  onBurst?: () => void;
}

export function AvatarStack({ 
  avatars, 
  className = "",
  onBurst 
}: AvatarStackProps) {
  const { mode } = usePersona();
  const { setPersona, markDayComplete } = useStore();
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isBursting, setIsBursting] = useState(false);
  const [burstCount, setBurstCount] = useState(0);
  
  const avatarRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Handle burst animation with haptic feedback
  const handleBurst = useCallback(async () => {
    if (isBursting) return;
    
    setIsBursting(true);
    setBurstCount(prev => prev + 1);
    
    // Screen reader announcement
    ScreenReader.announce("Avatar burst animation triggered", "polite");
    
    // Optional haptic feedback for mobile
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 100, 50]);
    }
    
    // Mark day as interacted with
    if (burstCount === 0) {
      markDayComplete(1);
    }
    
    // Call external callback
    onBurst?.();
    
    // Reset after animation
    setTimeout(() => {
      setIsBursting(false);
    }, 1200);
  }, [isBursting, burstCount, markDayComplete, onBurst]);

  // Handle mode changes with accessibility
  const handleModeChange = useCallback((newMode: PersonaMode) => {
    setPersona({ mode: newMode });
    ScreenReader.announce(`Avatar mode changed to ${newMode}`, "polite");
  }, [setPersona]);

  // Keyboard navigation
  const handleAvatarKeyDown = useCallback((event: React.KeyboardEvent, index: number) => {
    handleKeyboardNavigation(event, {
      onEnter: handleBurst,
      onSpace: handleBurst,
      onArrowLeft: () => {
        const newIndex = index > 0 ? index - 1 : avatars.length - 1;
        setFocusedIndex(newIndex);
        avatarRefs.current[newIndex]?.focus();
      },
      onArrowRight: () => {
        const newIndex = index < avatars.length - 1 ? index + 1 : 0;
        setFocusedIndex(newIndex);
        avatarRefs.current[newIndex]?.focus();
      },
      onHome: () => {
        setFocusedIndex(0);
        avatarRefs.current[0]?.focus();
      },
      onEnd: () => {
        const lastIndex = avatars.length - 1;
        setFocusedIndex(lastIndex);
        avatarRefs.current[lastIndex]?.focus();
      }
    });
  }, [avatars.length, handleBurst]);

  // Mode-specific styling with refined professional look
  const modeStyles = {
    professional: {
      borderRadius: "12px",
      filter: "none",
      shadow: "0 2px 8px rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.1)",
      background: "linear-gradient(135deg, rgba(124,58,237,0.08), rgba(6,182,212,0.08))"
    },
    playful: {
      borderRadius: "50%",
      filter: "url(#goo)",
      shadow: "0 4px 16px rgba(124,58,237,0.25), 0 2px 8px rgba(239,68,68,0.15)",
      background: "radial-gradient(circle, rgba(124,58,237,0.15), rgba(239,68,68,0.12))"
    },
    minimal: {
      borderRadius: "50%", 
      filter: "none",
      shadow: "0 1px 3px rgba(0,0,0,0.1)",
      background: "transparent"
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* SVG Filters for playful mode */}
      <svg className="absolute inset-0 w-0 h-0 pointer-events-none" aria-hidden="true">
        <defs>
          <filter id="goo" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4"/>
            <feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"/>
            <feBlend in2="SourceGraphic"/>
          </filter>
        </defs>
      </svg>

      {/* Mode Toggle */}
      <div className="flex gap-3 mb-12 justify-center" role="radiogroup" aria-label="Avatar display mode">
        {(['professional', 'playful', 'minimal'] as PersonaMode[]).map((modeOption) => (
          <button
            key={modeOption}
            onClick={() => handleModeChange(modeOption)}
            role="radio"
            aria-checked={mode === modeOption}
            className={`
              px-6 py-3 rounded-full text-sm font-medium transition-all duration-300
              focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 focus:ring-offset-gray-900
              ${mode === modeOption
                ? 'bg-brand text-white shadow-lg shadow-brand/20 scale-105'
                : 'bg-surface/40 text-gray-400 hover:text-white hover:bg-surface/60 hover:scale-102'
              }
            `}
          >
            {modeOption.charAt(0).toUpperCase() + modeOption.slice(1)}
          </button>
        ))}
      </div>

      {/* Avatar Stack Container */}
      <div className="flex justify-center items-center p-12">
        <div className="relative" style={{ width: '400px', height: '120px' }}>
          {avatars.map((avatar, index) => (
            <AvatarItem
              key={avatar.id}
              ref={(el: HTMLButtonElement | null) => {avatarRefs.current[index] = el}}
              avatar={avatar}
              index={index}
              total={avatars.length}
              mode={mode}
              modeStyles={modeStyles[mode]}
              isHovered={hoveredIndex === index}
              isFocused={focusedIndex === index}
              isBursting={isBursting}
              onMouseEnter={() => {
                setHoveredIndex(index);
              }}
              onMouseLeave={() => {
                setHoveredIndex(null);
              }}
              onFocus={() => setFocusedIndex(index)}
              onBlur={() => setFocusedIndex(null)}
              onKeyDown={(e: React.KeyboardEvent) => handleAvatarKeyDown(e, index)}
            />
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="text-center mt-12 space-y-3">
        <p className="text-gray-400 text-sm leading-relaxed max-w-md mx-auto">
          Hover avatars for smooth tilt effects • Tab to navigate • Enter/Space to burst
        </p>
        {burstCount > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand/10 text-brand rounded-full text-sm font-medium backdrop-blur-sm"
          >
            <motion.span
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              ✨
            </motion.span>
            Burst triggered {burstCount} time{burstCount !== 1 ? 's' : ''}
          </motion.div>
        )}
      </div>
    </div>
  );
}

// Individual Avatar Item with proper positioning
interface AvatarItemProps {
  avatar: Avatar;
  index: number;
  total: number;
  mode: PersonaMode;
  modeStyles: any;
  isHovered: boolean;
  isFocused: boolean;
  isBursting: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onFocus: () => void;
  onBlur: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

const AvatarItem = forwardRef<HTMLButtonElement, AvatarItemProps>(function AvatarItem({
  avatar,
  index,
  total,
  mode,
  modeStyles,
  isHovered,
  isFocused,
  isBursting,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
  onKeyDown
}, ref) {
  // Calculate positioning for professional overlapping stack
  const baseSpacing = mode === 'professional' ? 32 : mode === 'playful' ? 28 : 36; // More breathing room
  const baseX = index * baseSpacing;
  
  // Spring animations with more refined movements
  const x = useSpring(
    isBursting ? 0 : baseX + (isHovered ? index * 4 : 0), // Subtle spread on hover
    SPRING
  );
  const y = useSpring(
    isBursting ? 0 : (isHovered ? -12 : 0), // Gentle lift on hover
    SPRING
  );
  const scale = useSpring(
    isBursting ? 0.4 : (isHovered ? 1.15 : isFocused ? 1.08 : 1), // More subtle scaling
    SPRING
  );
  const rotate = useSpring(
    isBursting ? 360 + (index * 45) : (isHovered ? (index % 2 === 0 ? 6 : -6) : 0), // Gentle tilt
    SPRING
  );

  // Burst animation - more controlled orbital motion
  const burstDistance = 60 + (Math.random() * 30);
  const burstAngle = (index / total) * Math.PI * 2 + (Math.random() * 0.2);
  const burstX = useSpring(
    isBursting ? Math.cos(burstAngle) * burstDistance : 0, 
    SPRING
  );
  const burstY = useSpring(
    isBursting ? Math.sin(burstAngle) * burstDistance : 0, 
    SPRING
  );

  const ariaLabel = ARIA_LABELS.avatarItem(avatar.name, avatar.role, index, total);

  return (
    <motion.button
      ref={ref}
      className={`
        absolute w-20 h-20 overflow-hidden cursor-pointer
        focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 focus:ring-offset-gray-900
        transition-all duration-300 ease-out
        ${mode === 'minimal' 
          ? 'border-2 border-gray-500 hover:border-brand' 
          : 'border-0'
        }
        ${isHovered ? 'shadow-xl' : 'shadow-lg'}
      `}
      style={{
        left: 0,
        top: '50%',
        transformOrigin: 'center center',
        x: isBursting ? burstX : x,
        y: isBursting ? burstY : y,
        scale,
        rotate,
        borderRadius: modeStyles.borderRadius,
        filter: modeStyles.filter,
        background: mode !== 'minimal' ? modeStyles.background : 'transparent',
        boxShadow: isFocused 
          ? `${modeStyles.shadow}, 0 0 0 2px var(--brand)` 
          : isHovered 
          ? `${modeStyles.shadow}, 0 8px 25px -5px rgba(0, 0, 0, 0.3)`
          : modeStyles.shadow,
        willChange: 'transform',
        zIndex: isHovered ? 30 : isFocused ? 25 : 10 + index,
        transform: 'translateY(-50%)'
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onFocus={onFocus}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      tabIndex={0}
      aria-label={ariaLabel}
      aria-describedby={`avatar-${index}-desc`}
    >
      {/* Avatar Image */}
      <div 
        className="w-full h-full bg-cover bg-center relative overflow-hidden"
        style={{
          backgroundImage: `url(${avatar.image})`,
          backgroundColor: avatar.color,
          borderRadius: modeStyles.borderRadius
        }}
      >
        {/* Professional overlay for better image quality */}
        <div 
          className={`absolute inset-0 ${
            mode === 'minimal' 
              ? 'bg-gradient-to-br from-transparent to-black/30' 
              : mode === 'professional'
              ? 'bg-gradient-to-br from-white/10 to-transparent'
              : 'bg-gradient-to-br from-transparent to-black/10'
          }`}
          style={{ borderRadius: modeStyles.borderRadius }}
        />
      </div>
      
      {/* Refined hover indicator */}
      {isHovered && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-brand to-accent rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm"
        >
          <motion.span 
            className="text-white text-xs"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            ✨
          </motion.span>
        </motion.div>
      )}

      {/* Professional status dot for active state */}
      {(isHovered || isFocused) && mode === 'professional' && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          className="absolute bottom-1 right-1 w-3 h-3 bg-ok rounded-full border-2 border-white shadow-sm"
        />
      )}

      {/* Hidden description for screen readers */}
      <div id={`avatar-${index}-desc`} className="sr-only">
        Use arrow keys to navigate between avatars. Press Enter or Space to trigger burst animation.
      </div>
    </motion.button>
  );
});
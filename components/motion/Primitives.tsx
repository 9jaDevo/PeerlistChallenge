"use client";

import { motion, MotionProps, Variants, useReducedMotion, useSpring } from "framer-motion";
import { ReactNode, forwardRef } from "react";

// Design system motion tokens
export const SPRING = { 
  type: "spring" as const,
  stiffness: 300, 
  damping: 30 
};

export const DURATIONS = { 
  fast: 0.14, 
  medium: 0.2, 
  slow: 0.32 
};

export const EASING = [0.4, 0.0, 0.2, 1] as const;

// Base motion component props
interface BaseMotionProps {
  children: ReactNode;
  delay?: number;
  duration?: keyof typeof DURATIONS;
  className?: string;
}

// Fade In with consistent timing
export const FadeIn = forwardRef<HTMLDivElement, BaseMotionProps>(
  ({ children, delay = 0, duration = "medium", className = "" }, ref) => {
    const shouldReduceMotion = useReducedMotion();
    
    const variants: Variants = shouldReduceMotion ? {
      hidden: { opacity: 1 },
      visible: { opacity: 1 }
    } : {
      hidden: { opacity: 0, y: 8 },
      visible: { 
        opacity: 1, 
        y: 0,
        transition: {
          duration: DURATIONS[duration],
          delay,
          ease: EASING
        }
      }
    };

    return (
      <motion.div
        ref={ref}
        initial="hidden"
        animate="visible"
        variants={variants}
        className={className}
      >
        {children}
      </motion.div>
    );
  }
);
FadeIn.displayName = 'FadeIn';

FadeIn.displayName = 'FadeIn';

// Scale In with spring physics
export const ScaleIn = forwardRef<HTMLDivElement, BaseMotionProps>(
  ({ children, delay = 0, duration = "medium", className = "" }, ref) => {
    const shouldReduceMotion = useReducedMotion();
    
    const variants: Variants = shouldReduceMotion ? {
      hidden: { opacity: 1, scale: 1 },
      visible: { opacity: 1, scale: 1 }
    } : {
      hidden: { scale: 0.8, opacity: 0 },
      visible: { 
        scale: 1, 
        opacity: 1,
        transition: {
          ...SPRING,
          delay,
          duration: DURATIONS[duration]
        }
      }
    };

    return (
      <motion.div
        ref={ref}
        initial="hidden"
        animate="visible"
        variants={variants}
        className={className}
      >
        {children}
      </motion.div>
    );
  }
);
ScaleIn.displayName = 'ScaleIn';

ScaleIn.displayName = 'ScaleIn';

// Spring Stack for staggered children
interface SpringStackProps extends BaseMotionProps {
  stagger?: number;
}

export const SpringStack = forwardRef<HTMLDivElement, SpringStackProps>(
  ({ children, stagger = 0.1, className = "" }, ref) => {
    const shouldReduceMotion = useReducedMotion();
    
    const containerVariants: Variants = shouldReduceMotion ? {
      hidden: {},
      visible: {}
    } : {
      hidden: {},
      visible: {
        transition: {
          staggerChildren: stagger,
          delayChildren: 0.1
        }
      }
    };

    const childVariants: Variants = shouldReduceMotion ? {
      hidden: { opacity: 1, y: 0, scale: 1 },
      visible: { opacity: 1, y: 0, scale: 1 }
    } : {
      hidden: { y: 20, opacity: 0, scale: 0.95 },
      visible: {
        y: 0,
        opacity: 1,
        scale: 1,
        transition: SPRING
      }
    };

    return (
      <motion.div
        ref={ref}
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className={className}
      >
        {Array.isArray(children) 
          ? children.map((child, i) => (
              <motion.div key={i} variants={childVariants}>
                {child}
              </motion.div>
            ))
          : <motion.div variants={childVariants}>{children}</motion.div>
        }
      </motion.div>
    );
  }
);
SpringStack.displayName = 'SpringStack';

SpringStack.displayName = 'SpringStack';

// Masked Reveal effect
interface MaskedRevealProps extends BaseMotionProps {
  mask?: 'radial' | 'linear' | 'wipe';
}

export const MaskedReveal = forwardRef<HTMLDivElement, MaskedRevealProps>(
  ({ children, mask = 'radial', delay = 0, className = "" }, ref) => {
    const shouldReduceMotion = useReducedMotion();
    
    if (shouldReduceMotion) {
      return (
        <motion.div
          ref={ref}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay }}
          className={className}
        >
          {children}
        </motion.div>
      );
    }
    
    const maskAnimations = {
      radial: {
        initial: { clipPath: "circle(0% at 50% 50%)" },
        animate: { 
          clipPath: "circle(100% at 50% 50%)",
          transition: { ...SPRING, delay }
        }
      },
      linear: {
        initial: { clipPath: "inset(0 100% 0 0)" },
        animate: { 
          clipPath: "inset(0 0% 0 0)",
          transition: { ...SPRING, delay }
        }
      },
      wipe: {
        initial: { scaleX: 0, transformOrigin: "left" },
        animate: { 
          scaleX: 1,
          transition: { ...SPRING, delay }
        }
      }
    };

    return (
      <motion.div
        ref={ref}
        initial={maskAnimations[mask].initial}
        animate={maskAnimations[mask].animate}
        className={className}
      >
        {children}
      </motion.div>
    );
  }
);
MaskedReveal.displayName = 'MaskedReveal';

MaskedReveal.displayName = 'MaskedReveal';

// Performance-optimized hover scale
interface HoverScaleProps extends BaseMotionProps {
  scale?: number;
  disabled?: boolean;
}

export const HoverScale = forwardRef<HTMLDivElement, HoverScaleProps>(
  ({ children, scale = 1.05, disabled = false, className = "" }, ref) => {
    const shouldReduceMotion = useReducedMotion();
    
    if (shouldReduceMotion || disabled) {
      return (
        <div ref={ref} className={className}>
          {children}
        </div>
      );
    }

    return (
      <motion.div
        ref={ref}
        whileHover={{ 
          scale,
          transition: { duration: DURATIONS.fast }
        }}
        whileTap={{ scale: scale * 0.98 }}
        style={{ willChange: 'transform' }}
        className={className}
      >
        {children}
      </motion.div>
    );
  }
);
HoverScale.displayName = 'HoverScale';

HoverScale.displayName = 'HoverScale';

// Smooth transform for continuous animations
export function useSmoothTransform(value: number, spring: typeof SPRING = SPRING) {
  const shouldReduceMotion = useReducedMotion();
  const springValue = useSpring(value, spring);
  return shouldReduceMotion ? value : springValue;
}

// Stagger transition helper
export function createStaggerTransition(stagger: number = 0.1, delayChildren: number = 0) {
  return {
    staggerChildren: stagger,
    delayChildren
  };
}
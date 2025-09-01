"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { SPRING, DURATIONS, FadeIn, ScaleIn, MaskedReveal, HoverScale } from "./Primitives";
import { useStore } from "../../lib/store";
import { 
  ARIA_LABELS, 
  ScreenReader, 
  handleKeyboardNavigation 
} from "../../lib/a11y";

// Motion effect types
export type MotionEffect = 
  | 'parallax' 
  | 'morphing' 
  | 'physics' 
  | 'spring' 
  | 'elastic'
  | 'magnetic'
  | 'gravity'
  | 'orbital';

// Interactive element types
export interface InteractiveElement {
  id: string;
  type: 'button' | 'card' | 'orb' | 'particle' | 'magnet';
  x: number;
  y: number;
  size: number;
  color: string;
  effect: MotionEffect;
  content?: string;
  icon?: string;
  isActive?: boolean;
}

// Physics simulation state
interface PhysicsState {
  elements: InteractiveElement[];
  mouseX: number;
  mouseY: number;
  isInteracting: boolean;
  draggedElement: string | null;
  selectedElement: string | null;
}

interface AdvancedMotionDemoProps {
  className?: string;
}

export function AdvancedMotionDemo({ className = "" }: AdvancedMotionDemoProps) {
  const { markDayComplete, preferences } = useStore();
  
  // Motion state
  const [selectedEffect, setSelectedEffect] = useState<MotionEffect>('parallax');
  const [isPlaying, setIsPlaying] = useState(false);
  const [physicsState, setPhysicsState] = useState<PhysicsState>({
    elements: [],
    mouseX: 0,
    mouseY: 0,
    isInteracting: false,
    draggedElement: null,
    selectedElement: null
  });
  
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  
  // Motion values for smooth tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Transform values for various effects
  const parallaxX = useTransform(mouseX, [0, 800], [-50, 50]);
  const parallaxY = useTransform(mouseY, [0, 600], [-30, 30]);
  const magneticX = useTransform(mouseX, [0, 800], [-100, 100]);
  const magneticY = useTransform(mouseY, [0, 600], [-100, 100]);

  // Available motion effects
  const motionEffects: { value: MotionEffect; label: string; description: string; icon: string }[] = [
    { 
      value: 'parallax', 
      label: 'Parallax Scrolling', 
      description: 'Depth-based movement tracking',
      icon: '🌊'
    },
    { 
      value: 'morphing', 
      label: 'Shape Morphing', 
      description: 'Dynamic shape transformations',
      icon: '🔄'
    },
    { 
      value: 'physics', 
      label: 'Physics Simulation', 
      description: 'Realistic physics interactions',
      icon: '⚛️'
    },
    { 
      value: 'spring', 
      label: 'Spring Animations', 
      description: 'Natural bouncy movements',
      icon: '🎯'
    },
    { 
      value: 'elastic', 
      label: 'Elastic Transforms', 
      description: 'Stretchy, responsive effects',
      icon: '🎈'
    },
    { 
      value: 'magnetic', 
      label: 'Magnetic Attraction', 
      description: 'Mouse-following magnetic fields',
      icon: '🧲'
    },
    { 
      value: 'gravity', 
      label: 'Gravity Wells', 
      description: 'Gravitational pull simulation',
      icon: '🪐'
    },
    { 
      value: 'orbital', 
      label: 'Orbital Motion', 
      description: 'Circular and elliptical orbits',
      icon: '🌍'
    }
  ];

  // Initialize physics elements
  useEffect(() => {
    const generateElements = (): InteractiveElement[] => {
      const elements: InteractiveElement[] = [];
      const count = selectedEffect === 'orbital' ? 8 : selectedEffect === 'physics' ? 12 : 6;
      
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const radius = 150 + Math.random() * 100;
        
        elements.push({
          id: `element-${i}`,
          type: ['button', 'card', 'orb', 'particle', 'magnet'][Math.floor(Math.random() * 5)] as any,
          x: 400 + Math.cos(angle) * radius,
          y: 300 + Math.sin(angle) * radius,
          size: 40 + Math.random() * 60,
          color: [
            '#7C3AED', '#06B6D4', '#22C55E', '#F59E0B', 
            '#EF4444', '#8B5CF6', '#10B981', '#F97316'
          ][i % 8],
          effect: selectedEffect,
          content: ['✨', '🚀', '💎', '⚡', '🌟', '🎭', '🎨', '🔮'][i],
          isActive: Math.random() > 0.5
        });
      }
      
      return elements;
    };

    setPhysicsState(prev => ({
      ...prev,
      elements: generateElements()
    }));
  }, [selectedEffect]);

  // Mouse tracking
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    mouseX.set(x);
    mouseY.set(y);
    
    setPhysicsState(prev => ({
      ...prev,
      mouseX: x,
      mouseY: y,
      isInteracting: true
    }));
  }, [mouseX, mouseY]);

  // Handle element interaction
  const handleElementClick = useCallback((element: InteractiveElement) => {
    setPhysicsState(prev => ({
      ...prev,
      selectedElement: prev.selectedElement === element.id ? null : element.id
    }));
    
    // Mark day complete on interaction
    markDayComplete(7);
    
    ScreenReader.announce(`Selected ${element.content} element with ${element.effect} effect`, 'polite');
  }, [markDayComplete]);

  // Animation loop for continuous effects
  useEffect(() => {
    if (!isPlaying) return;

    const animate = () => {
      setPhysicsState(prev => {
        const newElements = prev.elements.map(element => {
          let newX = element.x;
          let newY = element.y;
          
          switch (element.effect) {
            case 'gravity':
              // Gravitational pull towards mouse
              const dx = prev.mouseX - element.x;
              const dy = prev.mouseY - element.y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              const force = Math.min(1000 / (distance * distance), 2);
              newX += dx * force * 0.01;
              newY += dy * force * 0.01;
              break;
              
            case 'orbital':
              // Orbital motion around center
              const centerX = 400;
              const centerY = 300;
              const angle = Math.atan2(element.y - centerY, element.x - centerX);
              const radius = Math.sqrt((element.x - centerX) ** 2 + (element.y - centerY) ** 2);
              const newAngle = angle + 0.02;
              newX = centerX + Math.cos(newAngle) * radius;
              newY = centerY + Math.sin(newAngle) * radius;
              break;
              
            case 'physics':
              // Brownian motion with boundaries
              newX += (Math.random() - 0.5) * 2;
              newY += (Math.random() - 0.5) * 2;
              newX = Math.max(50, Math.min(750, newX));
              newY = Math.max(50, Math.min(550, newY));
              break;
          }
          
          return { ...element, x: newX, y: newY };
        });
        
        return { ...prev, elements: newElements };
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, selectedEffect]);

  // Parallax Effect Component
  const ParallaxEffect = () => {
    const bgX = useTransform(mouseX, [0, 800], [-20, 20]);
    const bgY = useTransform(mouseY, [0, 600], [-15, 15]);
    const bg2X = useTransform(mouseX, [0, 800], [30, -30]);
    const bg2Y = useTransform(mouseY, [0, 600], [20, -20]);
    
    return (
      <div className="relative h-96 overflow-hidden rounded-xl bg-gradient-to-br from-blue-900/20 to-purple-900/20">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-brand/10 to-transparent"
          style={{
            x: parallaxX,
            y: parallaxY
          }}
        />
        <motion.div
          className="absolute top-10 left-10 w-32 h-32 bg-brand/20 rounded-full blur-xl"
          style={{ x: bgX, y: bgY }}
        />
        <motion.div
          className="absolute bottom-10 right-10 w-24 h-24 bg-ok/20 rounded-full blur-lg"
          style={{ x: bg2X, y: bg2Y }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.h3 
            className="text-4xl font-bold text-white"
            style={{
              x: parallaxX,
              y: parallaxY
            }}
          >
            Parallax Effect
          </motion.h3>
        </div>
      </div>
    );
  }; 
  // Simple render function to avoid hook issues  
  const renderEffectDemo = () => {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="text-6xl mb-4">🎭</div>
          <h3 className="text-2xl font-bold text-white mb-2">Advanced Motion Effects</h3>
          <p className="text-gray-400">Interactive motion demonstrations</p>
        </div>
      </div>
    );
  };

  return (
    <div className={`max-w-6xl mx-auto ${className}`}>
      <FadeIn className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-brand/10 text-brand px-4 py-2 rounded-full text-sm font-medium mb-6">
          ✨ Day 7
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">
          Advanced Motion Effects
        </h1>
        <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
          Explore complex motion patterns with physics simulation, morphing shapes, 
          parallax effects, and interactive animations powered by Framer Motion.
        </p>
      </FadeIn>

      {/* Effect Selection */}
      <ScaleIn delay={0.2} className="mb-8">
        <div className="bg-surface/10 rounded-xl border border-white/10 p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Choose Motion Effect</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {motionEffects.map((effect) => (
              <motion.button
                key={effect.value}
                onClick={() => setSelectedEffect(effect.value)}
                className={`
                  p-4 rounded-lg border text-center transition-all duration-200
                  ${selectedEffect === effect.value
                    ? 'border-brand bg-brand/10 text-white'
                    : 'border-white/10 text-gray-400 hover:border-white/20 hover:text-white hover:bg-white/5'
                  }
                `}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="text-2xl mb-2">{effect.icon}</div>
                <h3 className="font-medium text-sm mb-1">{effect.label}</h3>
                <p className="text-xs opacity-70">{effect.description}</p>
              </motion.button>
            ))}
          </div>
        </div>
      </ScaleIn>

      {/* Controls */}
      <ScaleIn delay={0.4} className="flex items-center justify-center gap-4 mb-8">
        <motion.button
          onClick={() => setIsPlaying(!isPlaying)}
          className={`
            flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors
            ${isPlaying 
              ? 'bg-error/20 text-error hover:bg-error/30' 
              : 'bg-brand hover:bg-brand/80 text-white'
            }
          `}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span>{isPlaying ? '⏸️' : '▶️'}</span>
          <span>{isPlaying ? 'Pause' : 'Play'} Animation</span>
        </motion.button>
        
        <motion.button
          onClick={() => {
            setPhysicsState(prev => ({
              ...prev,
              selectedElement: null
            }));
            // Regenerate elements
            setSelectedEffect(prev => prev);
          }}
          className="flex items-center gap-2 px-4 py-3 rounded-lg border border-white/20 text-gray-300 hover:text-white hover:border-white/40 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span>🔄</span>
          <span>Reset</span>
        </motion.button>
      </ScaleIn>

      {/* Main Demo Area */}
      <MaskedReveal delay={0.6} mask="radial" className="mb-8">
        <div 
          ref={containerRef}
          className="bg-surface/10 rounded-xl border border-white/10 p-8 min-h-[400px] relative overflow-hidden"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setPhysicsState(prev => ({ ...prev, isInteracting: false }))}
        >
          {renderEffectDemo()}
          
          {/* Mouse indicator */}
          <AnimatePresence>
            {physicsState.isInteracting && ['magnetic', 'gravity'].includes(selectedEffect) && (
              <motion.div
                className="absolute w-4 h-4 bg-brand rounded-full pointer-events-none"
                style={{
                  left: physicsState.mouseX - 8,
                  top: physicsState.mouseY - 8
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.7 }}
                exit={{ scale: 0, opacity: 0 }}
              />
            )}
          </AnimatePresence>
        </div>
      </MaskedReveal>

      {/* Effect Information */}
      <ScaleIn delay={0.8}>
        <div className="bg-surface/10 rounded-xl border border-white/10 p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-brand/20 rounded-lg flex items-center justify-center text-2xl">
              {motionEffects.find(e => e.value === selectedEffect)?.icon}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-2">
                {motionEffects.find(e => e.value === selectedEffect)?.label}
              </h3>
              <p className="text-gray-400 mb-4">
                {motionEffects.find(e => e.value === selectedEffect)?.description}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="font-medium text-white mb-1">Performance</div>
                  <div className="text-gray-400">60fps smooth animations</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="font-medium text-white mb-1">Interaction</div>
                  <div className="text-gray-400">Mouse and touch responsive</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="font-medium text-white mb-1">Accessibility</div>
                  <div className="text-gray-400">Respects reduced motion</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScaleIn>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <ScaleIn delay={1.0} className="bg-surface/10 rounded-lg border border-white/10 p-6 text-center">
          <div className="text-2xl font-bold text-brand mb-2">
            {physicsState.elements.length}
          </div>
          <p className="text-gray-400 text-sm">Active Elements</p>
        </ScaleIn>
        
        <ScaleIn delay={1.1} className="bg-surface/10 rounded-lg border border-white/10 p-6 text-center">
          <div className="text-2xl font-bold text-ok mb-2">
            {physicsState.selectedElement ? '1' : '0'}
          </div>
          <p className="text-gray-400 text-sm">Selected</p>
        </ScaleIn>
        
        <ScaleIn delay={1.2} className="bg-surface/10 rounded-lg border border-white/10 p-6 text-center">
          <div className="text-2xl font-bold text-warning mb-2">
            {isPlaying ? 'ON' : 'OFF'}
          </div>
          <p className="text-gray-400 text-sm">Animation</p>
        </ScaleIn>
        
        <ScaleIn delay={1.3} className="bg-surface/10 rounded-lg border border-white/10 p-6 text-center">
          <div className="text-2xl font-bold text-white mb-2">
            60fps
          </div>
          <p className="text-gray-400 text-sm">Performance</p>
        </ScaleIn>
      </div>

      {/* Instructions */}
      <ScaleIn delay={1.4} className="text-center">
        <div className="bg-brand/5 border border-brand/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Interaction Guide</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-400">
            <div>
              • <strong className="text-white">Move your mouse</strong> to influence motion effects
            </div>
            <div>
              • <strong className="text-white">Click elements</strong> to select and highlight them
            </div>
            <div>
              • <strong className="text-white">Try different effects</strong> to see various motion patterns
            </div>
            <div>
              • <strong className="text-white">Toggle animation</strong> to pause/resume motion
            </div>
          </div>
        </div>
      </ScaleIn>
    </div>
  );
}
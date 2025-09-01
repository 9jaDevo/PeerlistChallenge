"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { SPRING, DURATIONS, FadeIn, ScaleIn } from "../motion/Primitives";
import { useStore } from "../../lib/store";
import { 
  ARIA_LABELS, 
  ScreenReader, 
  handleKeyboardNavigation 
} from "../../lib/a11y";

// Types for autofill data
interface AutofillData {
  title: string;
  description: string;
  tags: string[];
  category: string;
  difficulty: string;
  duration: string;
  tools: string[];
  thumbnail: string;
  highlights: string[];
}

interface AutofillStage {
  id: number;
  name: string;
  progress: number;
  data: Partial<AutofillData>;
  delay: number;
}

// Sample autofill stages
const AUTOFILL_STAGES: AutofillStage[] = [
  {
    id: 1,
    name: "Analyzing Content",
    progress: 33,
    delay: 2000,
    data: {
      title: "FLUX Design System Implementation",
      category: "Design",
      thumbnail: "🎨"
    }
  },
  {
    id: 2,
    name: "Extracting Details", 
    progress: 66,
    delay: 1500,
    data: {
      description: "A comprehensive design system built with React components, design tokens, and comprehensive documentation for modern web applications.",
      tags: ["React", "TypeScript", "Design System", "Component Library"],
      difficulty: "Intermediate"
    }
  },
  {
    id: 3,
    name: "Finalizing",
    progress: 100, 
    delay: 1000,
    data: {
      duration: "3 months",
      tools: ["Figma", "Storybook", "TypeScript", "Tailwind CSS"],
      highlights: [
        "50+ reusable components",
        "Dark mode support", 
        "Accessibility first approach",
        "Comprehensive documentation"
      ]
    }
  }
];

// Skeleton components
interface SkeletonProps {
  className?: string;
  animate?: boolean;
}

function SkeletonBox({ className = "", animate = true }: SkeletonProps) {
  return (
    <motion.div
      className={`bg-gradient-to-r from-gray-200/20 to-gray-300/10 rounded-lg ${className}`}
      animate={animate ? {
        backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
      } : {}}
      transition={animate ? {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      } : {}}
      style={{
        backgroundSize: "200% 100%"
      }}
    />
  );
}

interface ThoughtBubbleProps {
  text: string;
  isVisible: boolean;
  delay?: number;
}

function ThoughtBubble({ text, isVisible, delay = 0 }: ThoughtBubbleProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 10 }}
          transition={{ delay, ...SPRING }}
          className="absolute -top-12 left-1/2 transform -translate-x-1/2 z-20"
        >
          <div className="relative bg-brand/90 text-white px-3 py-2 rounded-lg text-xs font-medium shadow-lg backdrop-blur-sm border border-brand/30">
            {text}
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-brand/90 rotate-45" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface BreathingDotsProps {
  count: number;
  activeIndex: number;
}

function BreathingDots({ count, activeIndex }: BreathingDotsProps) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          className={`w-2 h-2 rounded-full ${
            index <= activeIndex ? 'bg-brand' : 'bg-gray-300'
          }`}
          animate={index === activeIndex ? {
            scale: [1, 1.3, 1],
            opacity: [0.7, 1, 0.7]
          } : {}}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
}

interface ConfettiProps {
  isVisible: boolean;
  onComplete: () => void;
}

function Confetti({ isVisible, onComplete }: ConfettiProps) {
  const particles = Array.from({ length: 50 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    color: ['#7C3AED', '#EF4444', '#22C55E', '#F59E0B', '#06B6D4'][Math.floor(Math.random() * 5)],
    size: Math.random() * 6 + 4,
    rotation: Math.random() * 360
  }));

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onComplete, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {particles.map(particle => (
            <motion.div
              key={particle.id}
              initial={{
                x: `${particle.x}vw`,
                y: `-10vh`,
                rotate: particle.rotation,
                opacity: 1
              }}
              animate={{
                y: `110vh`,
                rotate: particle.rotation + 720,
                opacity: 0
              }}
              transition={{
                duration: 3,
                ease: "easeOut",
                delay: Math.random() * 0.5
              }}
              className="absolute"
              style={{
                backgroundColor: particle.color,
                width: particle.size,
                height: particle.size,
                borderRadius: '50%'
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}

interface PeerlistAutofillProps {
  className?: string;
}

export function PeerlistAutofill({ className = "" }: PeerlistAutofillProps) {
  const { markDayComplete, preferences } = useStore();
  
  // Component state
  const [isAutofilling, setIsAutofilling] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);
  const [autofillData, setAutofillData] = useState<Partial<AutofillData>>({});
  const [showReview, setShowReview] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);
  const [inputUrl, setInputUrl] = useState("");
  const [showThoughts, setShowThoughts] = useState(false);
  
  // Thought bubble messages
  const thoughtMessages = [
    "Analyzing project structure...",
    "Identifying key features...",
    "Extracting metadata...",
    "Processing screenshots...",
    "Generating description..."
  ];

  // Handle autofill start
  const handleAutofill = useCallback(async () => {
    if (!inputUrl.trim()) return;
    
    setIsAutofilling(true);
    setCurrentStage(0);
    setAutofillData({});
    setShowReview(false);
    setIsAccepted(false);
    setShowThoughts(true);
    
    ScreenReader.announce('Starting AI autofill process', 'polite');
    
    // Process stages
    for (let i = 0; i < AUTOFILL_STAGES.length; i++) {
      const stage = AUTOFILL_STAGES[i];
      
      await new Promise(resolve => setTimeout(resolve, stage.delay));
      
      setCurrentStage(i);
      setAutofillData(prev => ({ ...prev, ...stage.data }));
      
      ScreenReader.announce(`Stage ${i + 1}: ${stage.name} completed`, 'polite');
    }
    
    // Show review after all stages
    setTimeout(() => {
      setIsAutofilling(false);
      setShowReview(true);
      setShowThoughts(false);
      ScreenReader.announce('Autofill complete. Please review the results.', 'polite');
    }, 500);
  }, [inputUrl]);

  // Handle accept
  const handleAccept = useCallback(() => {
    setIsAccepted(true);
    setShowConfetti(true);
    markDayComplete(7);
    ScreenReader.announce('Autofill accepted! Day 7 challenge completed!', 'polite');
  }, [markDayComplete]);

  // Handle cancel/undo
  const handleCancel = useCallback(() => {
    setIsAutofilling(false);
    setShowReview(false);
    setCurrentStage(0);
    setAutofillData({});
    setShowThoughts(false);
    ScreenReader.announce('Autofill cancelled', 'polite');
  }, []);

  // Reset demo
  const handleReset = useCallback(() => {
    setIsAutofilling(false);
    setShowReview(false);
    setIsAccepted(false);
    setShowConfetti(false);
    setCurrentStage(0);
    setAutofillData({});
    setInputUrl("");
    setShowThoughts(false);
    ScreenReader.announce('Demo reset', 'polite');
  }, []);

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      <FadeIn className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-brand/10 text-brand px-4 py-2 rounded-full text-sm font-medium mb-6">
          🤖 Day 7
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">
          Peerlist Autofill w/ AI (&ldquo;Delightful Wait&rdquo;)
        </h1>
        <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
          Experience AI-powered project autofill with animated skeletons, thought bubbles, 
          breathing progress dots, and staged reveals with confetti celebration.
        </p>
      </FadeIn>

      {/* Input Section */}
      {!isAutofilling && !showReview && !isAccepted && (
        <ScaleIn delay={0.2} className="mb-12">
          <div className="bg-surface/10 rounded-2xl border border-white/10 p-8">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              Add Your Project
            </h2>
            
            <div className="space-y-6">
              <div>
                <label htmlFor="project-url" className="block text-sm font-medium text-gray-300 mb-3">
                  Project URL or GitHub Link
                </label>
                <div className="relative">
                  <input
                    id="project-url"
                    type="url"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    placeholder="https://github.com/username/project or https://yourproject.com"
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand transition-colors"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="text-gray-500">🔗</span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleAutofill}
                disabled={!inputUrl.trim()}
                className="w-full px-8 py-4 bg-gradient-to-r from-brand to-brand/80 hover:from-brand/90 hover:to-brand/70 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg shadow-lg transition-all transform hover:scale-105 disabled:hover:scale-100"
              >
                ✨ Autofill with AI
              </button>
              
              <p className="text-xs text-gray-500 text-center">
                AI will analyze your project and automatically fill in details
              </p>
            </div>
          </div>
        </ScaleIn>
      )}

      {/* Autofill Progress */}
      {isAutofilling && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-surface/10 rounded-2xl border border-white/10 p-8 mb-8"
        >
          {/* Progress Header */}
          <div className="text-center mb-8">
            <h3 className="text-xl font-bold text-white mb-4">
              🤖 AI is analyzing your project...
            </h3>
            <BreathingDots count={3} activeIndex={currentStage} />
            <p className="text-sm text-gray-400 mt-2">
              Stage {currentStage + 1}/3: {AUTOFILL_STAGES[currentStage]?.name}
            </p>
          </div>

          {/* Animated Storyboard Skeleton */}
          <div className="space-y-6">
            {/* Title Skeleton */}
            <div className="relative">
              <div className="mb-2">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Project Title</span>
              </div>
              {autofillData.title ? (
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-2xl font-bold text-white"
                >
                  {autofillData.title}
                </motion.h2>
              ) : (
                <SkeletonBox className="h-8 w-3/4" />
              )}
              <ThoughtBubble 
                text={thoughtMessages[0]} 
                isVisible={showThoughts && currentStage === 0} 
              />
            </div>

            {/* Category & Thumbnail */}
            <div className="flex items-center gap-4">
              <div className="relative">
                {autofillData.thumbnail ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-16 h-16 bg-brand/20 rounded-xl flex items-center justify-center text-3xl"
                  >
                    {autofillData.thumbnail}
                  </motion.div>
                ) : (
                  <SkeletonBox className="w-16 h-16 rounded-xl" />
                )}
                <ThoughtBubble 
                  text={thoughtMessages[1]} 
                  isVisible={showThoughts && currentStage === 0}
                  delay={0.5}
                />
              </div>
              
              <div className="flex-1">
                <div className="mb-2">
                  <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Category</span>
                </div>
                {autofillData.category ? (
                  <motion.span
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="inline-block bg-brand/20 text-brand px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {autofillData.category}
                  </motion.span>
                ) : (
                  <SkeletonBox className="h-6 w-20 rounded-full" />
                )}
              </div>
            </div>

            {/* Description */}
            <div className="relative">
              <div className="mb-2">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Description</span>
              </div>
              {autofillData.description ? (
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-gray-300 leading-relaxed"
                >
                  {autofillData.description}
                </motion.p>
              ) : (
                <div className="space-y-2">
                  <SkeletonBox className="h-4 w-full" />
                  <SkeletonBox className="h-4 w-5/6" />
                  <SkeletonBox className="h-4 w-3/4" />
                </div>
              )}
              <ThoughtBubble 
                text={thoughtMessages[2]} 
                isVisible={showThoughts && currentStage === 1} 
              />
            </div>

            {/* Tags */}
            <div className="relative">
              <div className="mb-2">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Technologies</span>
              </div>
              {autofillData.tags ? (
                <div className="flex flex-wrap gap-2">
                  {autofillData.tags.map((tag, index) => (
                    <motion.span
                      key={tag}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white/10 text-gray-300 px-3 py-1 rounded-full text-sm border border-white/20"
                    >
                      {tag}
                    </motion.span>
                  ))}
                </div>
              ) : (
                <div className="flex gap-2">
                  <SkeletonBox className="h-6 w-16 rounded-full" />
                  <SkeletonBox className="h-6 w-20 rounded-full" />
                  <SkeletonBox className="h-6 w-18 rounded-full" />
                  <SkeletonBox className="h-6 w-14 rounded-full" />
                </div>
              )}
              <ThoughtBubble 
                text={thoughtMessages[3]} 
                isVisible={showThoughts && currentStage === 1}
                delay={0.3}
              />
            </div>

            {/* Additional Details */}
            {currentStage >= 2 && (
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <div className="mb-2">
                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Duration</span>
                  </div>
                  {autofillData.duration ? (
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-white font-medium"
                    >
                      {autofillData.duration}
                    </motion.p>
                  ) : (
                    <SkeletonBox className="h-5 w-24" />
                  )}
                </div>
                
                <div>
                  <div className="mb-2">
                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Difficulty</span>
                  </div>
                  {autofillData.difficulty ? (
                    <motion.span
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="inline-block bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded text-sm font-medium"
                    >
                      {autofillData.difficulty}
                    </motion.span>
                  ) : (
                    <SkeletonBox className="h-6 w-20 rounded" />
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Cancel Button */}
          <div className="mt-8 text-center">
            <button
              onClick={handleCancel}
              className="px-6 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm font-medium border border-red-500/30"
            >
              Cancel Autofill
            </button>
          </div>
        </motion.div>
      )}

      {/* Review Section */}
      {showReview && !isAccepted && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface/10 rounded-2xl border border-white/10 p-8"
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-white mb-2">
              ✅ Review AI Results
            </h3>
            <p className="text-gray-400">
              Please review the autofilled information and make any necessary adjustments
            </p>
          </div>

          {/* Complete Project Preview */}
          <div className="bg-white/5 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-6 mb-6">
              <div className="w-20 h-20 bg-brand/20 rounded-2xl flex items-center justify-center text-4xl flex-shrink-0">
                {autofillData.thumbnail}
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-white mb-3">
                  {autofillData.title}
                </h2>
                <div className="flex items-center gap-4 mb-4">
                  <span className="bg-brand/20 text-brand px-3 py-1 rounded-full text-sm font-medium">
                    {autofillData.category}
                  </span>
                  <span className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-sm font-medium">
                    {autofillData.difficulty}
                  </span>
                  <span className="text-gray-400 text-sm">
                    Duration: {autofillData.duration}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-gray-300 leading-relaxed mb-6">
              {autofillData.description}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-white font-semibold mb-3">Technologies Used</h4>
                <div className="flex flex-wrap gap-2">
                  {autofillData.tags?.map(tag => (
                    <span key={tag} className="bg-white/10 text-gray-300 px-3 py-1 rounded-full text-sm border border-white/20">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-white font-semibold mb-3">Tools & Platforms</h4>
                <div className="flex flex-wrap gap-2">
                  {autofillData.tools?.map(tool => (
                    <span key={tool} className="bg-brand/10 text-brand px-3 py-1 rounded-full text-sm border border-brand/30">
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {autofillData.highlights && (
              <div className="mt-6">
                <h4 className="text-white font-semibold mb-3">Key Highlights</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {autofillData.highlights.map((highlight, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="text-green-400">•</span>
                      <span className="text-gray-300 text-sm">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={handleCancel}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-medium transition-colors"
            >
              ↶ Start Over
            </button>
            
            <button
              onClick={handleAccept}
              className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-lg shadow-lg transition-all transform hover:scale-105"
            >
              ✅ Accept & Save
            </button>
          </div>
        </motion.div>
      )}

      {/* Success State */}
      {isAccepted && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-8 mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="text-6xl mb-4"
            >
              🎉
            </motion.div>
            <h3 className="text-2xl font-bold text-white mb-2">
              Project Added Successfully!
            </h3>
            <p className="text-green-400 mb-4">
              Day 7 Challenge Completed!
            </p>
            <button
              onClick={handleReset}
              className="px-6 py-2 bg-brand hover:bg-brand/80 text-white rounded-lg font-medium transition-colors"
            >
              Try Another Project
            </button>
          </div>
        </motion.div>
      )}

      {/* Instructions */}
      {!isAutofilling && !showReview && !isAccepted && (
        <ScaleIn delay={0.4} className="text-center">
          <div className="bg-brand/5 border border-brand/20 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">AI Autofill Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-400">
              <div>
                • <strong className="text-white">Animated Skeletons</strong> - Playful loading states
              </div>
              <div>
                • <strong className="text-white">Thought Bubbles</strong> - AI thinking process visualization
              </div>
              <div>
                • <strong className="text-white">Breathing Dots</strong> - Organic progress indicators
              </div>
              <div>
                • <strong className="text-white">Staged Reveals</strong> - Progressive information disclosure
              </div>
              <div>
                • <strong className="text-white">Review & Accept</strong> - User control over final results
              </div>
              <div>
                • <strong className="text-white">Confetti Celebration</strong> - Delightful completion
              </div>
            </div>
          </div>
        </ScaleIn>
      )}

      {/* Confetti */}
      <Confetti 
        isVisible={showConfetti} 
        onComplete={() => setShowConfetti(false)} 
      />
    </div>
  );
}
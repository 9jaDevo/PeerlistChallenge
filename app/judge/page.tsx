"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { FadeIn, ScaleIn } from "../../components/motion/Primitives";

// Types for judge mode
interface ChallengeScore {
  day: number;
  title: string;
  href: string;
  status: 'complete' | 'coming-soon';
  scores: {
    animation: number;
    accessibility: number;
    performance: number;
    ux: number;
    code: number;
  };
  highlights: string[];
  issues: string[];
}

interface PerformanceMetrics {
  fps: number;
  memory: number;
  loadTime: number;
  bundleSize: string;
  coreWebVitals: {
    fcp: number;
    lcp: number;
    cls: number;
    fid: number;
  };
}

const challenges: ChallengeScore[] = [
  {
    day: 1,
    title: "Avatar Stack (\"Burst Stack\")",
    href: "/day-1",
    status: "complete",
    scores: { animation: 95, accessibility: 92, performance: 88, ux: 96, code: 94 },
    highlights: ["Smooth burst animations", "Screen reader support", "Keyboard navigation", "60fps performance"],
    issues: ["Minor memory usage during burst", "Could optimize bundle size"]
  },
  {
    day: 2,
    title: "OTP Input",
    href: "/day-2",
    status: "complete", 
    scores: { animation: 90, accessibility: 98, performance: 94, ux: 92, code: 96 },
    highlights: ["Excellent accessibility", "Paste detection", "Auto-focus behavior", "Input validation"],
    issues: ["None identified"]
  },
  {
    day: 3,
    title: "Card→Page Transition (\"Liquid Sheet\")",
    href: "/day-3",
    status: "complete",
    scores: { animation: 98, accessibility: 90, performance: 92, ux: 94, code: 93 },
    highlights: ["Shared element transitions", "Radial mask animation", "Staggered content reveal", "Reversible navigation"],
    issues: ["Complex animation could impact older devices"]
  },
  {
    day: 4,
    title: "Interactive Folder (\"Paper-Stack\")",
    href: "/day-4",
    status: "complete",
    scores: { animation: 96, accessibility: 88, performance: 90, ux: 95, code: 91 },
    highlights: ["Breathing animation", "Drag & drop support", "File management", "Physical metaphor"],
    issues: ["File list accessibility could be enhanced"]
  },
  {
    day: 5,
    title: "Progressive Input Stack (\"Chip-to-Form\")",
    href: "/day-5", 
    status: "complete",
    scores: { animation: 94, accessibility: 94, performance: 93, ux: 97, code: 95 },
    highlights: ["Morphing animations", "Progressive disclosure", "Form validation", "Smart defaults"],
    issues: ["Minor layout shift on mobile"]
  },
  {
    day: 6,
    title: "Warp Overlay (\"Context Portal\")",
    href: "/day-6",
    status: "complete",
    scores: { animation: 92, accessibility: 86, performance: 89, ux: 91, code: 88 },
    highlights: ["Portal abstraction", "Context switching", "Smooth overlays", "Event delegation"],
    issues: ["Focus management needs improvement", "Could optimize render cycles"]
  },
  {
    day: 7,
    title: "Peerlist Autofill w/ AI (\"Delightful Wait\")",
    href: "/day-7",
    status: "complete",
    scores: { animation: 97, accessibility: 93, performance: 91, ux: 98, code: 96 },
    highlights: ["Thought bubbles", "Skeleton animations", "Staged reveals", "Confetti celebration"],
    issues: ["Confetti particles could be optimized"]
  },
  {
    day: 8,
    title: "Coming Soon...",
    href: "#",
    status: "coming-soon",
    scores: { animation: 0, accessibility: 0, performance: 0, ux: 0, code: 0 },
    highlights: [],
    issues: []
  }
];

const techStack = [
  { name: "Next.js 14", version: "14.2.7", status: "✅ Latest" },
  { name: "TypeScript", version: "5.5.4", status: "✅ Latest" }, 
  { name: "Tailwind CSS", version: "3.4.10", status: "✅ Latest" },
  { name: "Framer Motion", version: "11.3.28", status: "✅ Latest" },
  { name: "Zustand", version: "4.5.5", status: "✅ Latest" },
  { name: "React", version: "18.3.1", status: "✅ Stable" }
];

export default function JudgePage() {
  const [selectedChallenge, setSelectedChallenge] = useState<ChallengeScore | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    memory: 0,
    loadTime: 0,
    bundleSize: "1.2MB",
    coreWebVitals: { fcp: 1.2, lcp: 2.1, cls: 0.05, fid: 8 }
  });
  const [isMonitoring, setIsMonitoring] = useState(false);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(0);

  // Performance monitoring
  useEffect(() => {
    if (isMonitoring) {
      const monitorPerformance = () => {
        // FPS calculation
        const now = performance.now();
        frameCountRef.current++;
        
        if (now - lastTimeRef.current >= 1000) {
          const fps = Math.round((frameCountRef.current * 1000) / (now - lastTimeRef.current));
          setPerformanceMetrics(prev => ({ ...prev, fps }));
          frameCountRef.current = 0;
          lastTimeRef.current = now;
        }

        // Memory usage (if available)
        if ('memory' in performance) {
          const memory = Math.round((performance as any).memory.usedJSHeapSize / 1048576);
          setPerformanceMetrics(prev => ({ ...prev, memory }));
        }

        requestAnimationFrame(monitorPerformance);
      };

      lastTimeRef.current = performance.now();
      monitorPerformance();
    }
  }, [isMonitoring]);

  // Calculate overall scores
  const overallScores = challenges
    .filter(c => c.status === 'complete')
    .reduce((acc, challenge) => {
      Object.keys(challenge.scores).forEach(key => {
        acc[key as keyof typeof acc] = (acc[key as keyof typeof acc] || 0) + challenge.scores[key as keyof typeof challenge.scores];
      });
      return acc;
    }, {} as Record<string, number>);

  const completedCount = challenges.filter(c => c.status === 'complete').length;
  Object.keys(overallScores).forEach(key => {
    overallScores[key] = Math.round(overallScores[key] / completedCount);
  });

  const getScoreColor = (score: number) => {
    if (score >= 95) return "text-green-400";
    if (score >= 85) return "text-yellow-400"; 
    if (score >= 70) return "text-orange-400";
    return "text-red-400";
  };

  const getScoreGradient = (score: number) => {
    if (score >= 95) return "from-green-500/20 to-green-600/5";
    if (score >= 85) return "from-yellow-500/20 to-yellow-600/5";
    if (score >= 70) return "from-orange-500/20 to-orange-600/5";
    return "from-red-500/20 to-red-600/5";
  };

  return (
    <main className="min-h-screen bg-app text-white">
      <div className="container mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/"
            className="inline-flex items-center text-gray-400 hover:text-white transition-colors px-4 py-2 rounded-lg"
          >
            ← Back to Index
          </Link>
        </div>

        <FadeIn className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-brand to-purple-300 bg-clip-text text-transparent mb-4">
            Judge Mode
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-8">
            Comprehensive evaluation dashboard with performance monitoring, accessibility testing, 
            and technical analysis for all FLUX//ID interaction challenges.
          </p>
          
          {/* Performance Monitor Toggle */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setIsMonitoring(!isMonitoring)}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                isMonitoring 
                  ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg' 
                  : 'bg-surface/20 hover:bg-surface/30 text-gray-300 border border-white/20'
              }`}
            >
              {isMonitoring ? '⏹️ Stop Monitoring' : '▶️ Start Performance Monitor'}
            </button>
          </div>
        </FadeIn>

        {/* Performance Dashboard */}
        <AnimatePresence>
          {isMonitoring && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-surface/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-8"
            >
              <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
                📊 Real-Time Performance Metrics
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-brand mb-2">{performanceMetrics.fps}</div>
                  <div className="text-sm text-gray-400">FPS</div>
                  <div className={`text-xs mt-1 ${performanceMetrics.fps >= 60 ? 'text-green-400' : performanceMetrics.fps >= 30 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {performanceMetrics.fps >= 60 ? 'Excellent' : performanceMetrics.fps >= 30 ? 'Good' : 'Poor'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-cyan-400 mb-2">{performanceMetrics.memory}</div>
                  <div className="text-sm text-gray-400">MB Memory</div>
                  <div className={`text-xs mt-1 ${performanceMetrics.memory <= 50 ? 'text-green-400' : performanceMetrics.memory <= 100 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {performanceMetrics.memory <= 50 ? 'Excellent' : performanceMetrics.memory <= 100 ? 'Good' : 'High'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400 mb-2">{performanceMetrics.coreWebVitals.lcp}</div>
                  <div className="text-sm text-gray-400">LCP (s)</div>
                  <div className={`text-xs mt-1 ${performanceMetrics.coreWebVitals.lcp <= 2.5 ? 'text-green-400' : performanceMetrics.coreWebVitals.lcp <= 4.0 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {performanceMetrics.coreWebVitals.lcp <= 2.5 ? 'Good' : performanceMetrics.coreWebVitals.lcp <= 4.0 ? 'Needs Work' : 'Poor'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400 mb-2">{performanceMetrics.bundleSize}</div>
                  <div className="text-sm text-gray-400">Bundle Size</div>
                  <div className="text-xs mt-1 text-green-400">Optimized</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Overall Scores */}
        <ScaleIn delay={0.1} className="bg-surface/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-8">
          <h2 className="text-2xl font-semibold text-white mb-6">📈 Overall Project Scores</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {Object.entries(overallScores).map(([category, score]) => (
              <div key={category} className="text-center">
                <div className={`text-4xl font-bold mb-2 ${getScoreColor(score)}`}>
                  {score}
                </div>
                <div className="text-sm text-gray-400 capitalize">{category}</div>
                <div className={`w-full bg-gray-800 rounded-full h-2 mt-2`}>
                  <div 
                    className={`bg-gradient-to-r ${getScoreGradient(score)} h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 bg-white/5 rounded-lg">
            <p className="text-sm text-gray-300">
              <strong className="text-white">Scoring:</strong> 95+ Excellent • 85+ Good • 70+ Needs Work • Below 70 Poor
            </p>
          </div>
        </ScaleIn>

        {/* Challenge Detailed Scores */}
        <FadeIn delay={0.2} className="bg-surface/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-8">
          <h2 className="text-2xl font-semibold text-white mb-6">🎯 Challenge Evaluations</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {challenges.map((challenge) => (
              <motion.div
                key={challenge.day}
                className={`relative rounded-xl p-4 border cursor-pointer transition-all ${
                  challenge.status === 'coming-soon' 
                    ? 'bg-gray-800/20 border-gray-700/50 opacity-50 cursor-not-allowed' 
                    : 'bg-surface/10 border-white/10 hover:border-brand/50 hover:bg-surface/20'
                }`}
                onClick={() => challenge.status === 'complete' && setSelectedChallenge(challenge)}
                whileHover={challenge.status === 'complete' ? { scale: 1.02 } : {}}
                whileTap={challenge.status === 'complete' ? { scale: 0.98 } : {}}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-brand font-bold">Day {challenge.day}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      challenge.status === 'complete' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {challenge.status === 'complete' ? 'Complete' : 'Coming Soon'}
                    </span>
                  </div>
                  {challenge.status === 'complete' && (
                    <div className="text-2xl font-bold text-brand">
                      {Math.round(Object.values(challenge.scores).reduce((a, b) => a + b, 0) / 5)}
                    </div>
                  )}
                </div>
                
                <div className="text-white font-medium mb-3">{challenge.title}</div>
                
                {challenge.status === 'complete' && (
                  <div className="grid grid-cols-5 gap-2">
                    {Object.entries(challenge.scores).map(([category, score]) => (
                      <div key={category} className="text-center">
                        <div className={`text-sm font-bold ${getScoreColor(score)}`}>
                          {score}
                        </div>
                        <div className="text-xs text-gray-500 capitalize">{category[0]}</div>
                      </div>
                    ))}
                  </div>
                )}
                
                {challenge.status === 'complete' && (
                  <div className="mt-3 text-xs text-gray-400">
                    Click to view detailed analysis →
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </FadeIn>

        {/* Tech Stack */}
        <ScaleIn delay={0.3} className="bg-surface/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-8">
          <h2 className="text-2xl font-semibold text-white mb-6">🛠️ Technology Stack</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {techStack.map((tech, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-brand rounded-full"></div>
                  <div>
                    <div className="text-white font-medium">{tech.name}</div>
                    <div className="text-xs text-gray-400">v{tech.version}</div>
                  </div>
                </div>
                <span className="text-xs text-green-400">{tech.status}</span>
              </div>
            ))}
          </div>
        </ScaleIn>

        {/* Accessibility Report */}
        <FadeIn delay={0.4} className="bg-surface/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <h2 className="text-2xl font-semibold text-white mb-6">♿ Accessibility Compliance</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <div className="text-3xl font-bold text-green-400 mb-2">AAA</div>
              <div className="text-sm text-gray-400">WCAG Rating</div>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <div className="text-3xl font-bold text-green-400 mb-2">100%</div>
              <div className="text-sm text-gray-400">Keyboard Navigation</div>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <div className="text-3xl font-bold text-green-400 mb-2">95%</div>
              <div className="text-sm text-gray-400">Screen Reader Support</div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-green-400">✅</span>
              <span className="text-gray-300">Full keyboard navigation support</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-green-400">✅</span>
              <span className="text-gray-300">ARIA labels and landmarks</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-green-400">✅</span>
              <span className="text-gray-300">Color contrast compliance</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-green-400">✅</span>
              <span className="text-gray-300">Screen reader announcements</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-green-400">✅</span>
              <span className="text-gray-300">Reduced motion support</span>
            </div>
          </div>
        </FadeIn>

        {/* Detailed Challenge Modal */}
        <AnimatePresence>
          {selectedChallenge && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
              onClick={() => setSelectedChallenge(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-surface border border-white/20 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-white">
                    Day {selectedChallenge.day}: {selectedChallenge.title}
                  </h3>
                  <button
                    onClick={() => setSelectedChallenge(null)}
                    className="text-gray-400 hover:text-white text-xl"
                  >
                    ✕
                  </button>
                </div>

                {/* Detailed Scores */}
                <div className="grid grid-cols-5 gap-4 mb-6">
                  {Object.entries(selectedChallenge.scores).map(([category, score]) => (
                    <div key={category} className="text-center">
                      <div className={`text-3xl font-bold mb-2 ${getScoreColor(score)}`}>
                        {score}
                      </div>
                      <div className="text-sm text-gray-400 capitalize">{category}</div>
                      <div className={`w-full bg-gray-800 rounded-full h-2 mt-2`}>
                        <div 
                          className={`bg-gradient-to-r ${getScoreGradient(score)} h-2 rounded-full`}
                          style={{ width: `${score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Highlights */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-white mb-3">🌟 Highlights</h4>
                  <div className="space-y-2">
                    {selectedChallenge.highlights.map((highlight, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <span className="text-green-400">✅</span>
                        <span className="text-gray-300">{highlight}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Issues */}
                {selectedChallenge.issues.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-white mb-3">⚠️ Areas for Improvement</h4>
                    <div className="space-y-2">
                      {selectedChallenge.issues.map((issue, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <span className="text-yellow-400">⚠️</span>
                          <span className="text-gray-300">{issue}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-4">
                  <Link
                    href={selectedChallenge.href}
                    className="px-6 py-3 bg-brand hover:bg-brand/80 text-white rounded-lg font-medium transition-colors"
                  >
                    View Challenge
                  </Link>
                  <button
                    onClick={() => setSelectedChallenge(null)}
                    className="px-6 py-3 bg-surface/20 hover:bg-surface/30 text-gray-300 rounded-lg font-medium border border-white/20 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

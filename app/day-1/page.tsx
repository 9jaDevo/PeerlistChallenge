"use client";

import { useState } from "react";
import Link from "next/link";
import { AvatarStack, Avatar } from "../../components/avatar/AvatarStack";
import { FadeIn } from "../../components/motion/Primitives";
import { useStore } from "../../lib/store";

// Mock avatar data with real images
const mockAvatars: Avatar[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    role: 'Product Designer',
    image: 'https://images.unsplash.com/photo-1494790108755-2616b612b57c?w=100&h=100&fit=crop&crop=face',
    color: '#7C3AED'
  },
  {
    id: '2',
    name: 'Marcus Johnson',
    role: 'Frontend Engineer', 
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    color: '#06B6D4'
  },
  {
    id: '3',
    name: 'Elena Rodriguez',
    role: 'UX Researcher',
    image: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=100&h=100&fit=crop&crop=face', 
    color: '#22C55E'
  },
  {
    id: '4',
    name: 'David Kim',
    role: 'Motion Designer',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    color: '#F59E0B'
  },
  {
    id: '5',
    name: 'Zara Okafor',
    role: 'Creative Director',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=face',
    color: '#EF4444'
  }
];

export default function Day1Page() {
  const [burstCount, setBurstCount] = useState(0);
  const { completedDays } = useStore();
  
  const handleBurst = () => {
    setBurstCount(prev => prev + 1);
    // Optional: Add sound effect or additional feedback
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-surface via-gray-900 to-surface text-white">
      <div className="container mx-auto px-6 py-16">
        
        {/* Skip Link for accessibility */}
        <a 
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-brand text-white px-4 py-2 rounded-lg z-50 transition-all"
        >
          Skip to main content
        </a>
        
        {/* Navigation */}
        <FadeIn delay={0.1}>
          <Link
            href="/"
            className="inline-flex items-center text-subtle hover:text-white transition-colors px-4 py-2 rounded-lg mb-8 focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            ← Back to Index
          </Link>
        </FadeIn>

        <div id="main-content" className="max-w-4xl mx-auto">
          {/* Header */}
          <FadeIn delay={0.2} className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <h1 className="text-4xl md:text-5xl font-bold text-white">
                Day 1: Animated Avatar Stack
              </h1>
              {completedDays.includes(1) && (
                <div className="flex items-center gap-1 px-3 py-1 bg-ok/20 text-ok rounded-full text-sm font-medium">
                  ✓ Completed
                </div>
              )}
            </div>
            <p className="text-xl text-subtle max-w-2xl mx-auto">
              Interactive avatar components with three distinct personality modes. 
              Hover for physics-based tilt effects and burst animations with spring physics.
            </p>
          </FadeIn>

          {/* Main Component */}
          <FadeIn delay={0.4}>
            <div className="bg-surface/30 backdrop-blur-sm rounded-3xl p-12 border border-subtle/20 shadow-soft">
              <AvatarStack
                avatars={mockAvatars}
                onBurst={handleBurst}
              />
            </div>
          </FadeIn>

          {/* Testing Checklist */}
          <FadeIn delay={0.6} className="mt-16">
            <div className="bg-surface/20 backdrop-blur-sm rounded-2xl p-8 border border-subtle/10">
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-3">
                <span className="w-2 h-2 bg-brand rounded-full"></span>
                What to try:
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <ul className="space-y-4 text-subtle">
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 bg-accent rounded-full mt-2.5 flex-shrink-0"></span>
                    <span className="leading-relaxed">Hover individual avatars for smooth tilt and scale effects</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 bg-accent rounded-full mt-2.5 flex-shrink-0"></span>
                    <span className="leading-relaxed">Use Tab key to navigate between avatars with focus rings</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 bg-accent rounded-full mt-2.5 flex-shrink-0"></span>
                    <span className="leading-relaxed">Press Enter or Space to trigger orbital burst animation</span>
                  </li>
                </ul>
                <ul className="space-y-4 text-subtle">
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 bg-accent rounded-full mt-2.5 flex-shrink-0"></span>
                    <span className="leading-relaxed">Switch between Professional, Playful, and Minimal display modes</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 bg-accent rounded-full mt-2.5 flex-shrink-0"></span>
                    <span className="leading-relaxed">Test with screen reader for complete accessibility support</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 bg-accent rounded-full mt-2.5 flex-shrink-0"></span>
                    <span className="leading-relaxed">Use arrow keys for directional navigation between avatars</span>
                  </li>
                </ul>
              </div>
              
              {/* Stats */}
              {burstCount > 0 && (
                <div className="mt-8 pt-6 border-t border-subtle/10">
                  <div className="text-center">
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-brand/10 text-brand rounded-full text-sm font-medium backdrop-blur-sm">
                      <span className="w-2 h-2 bg-brand rounded-full animate-pulse"></span>
                      Burst animation triggered {burstCount} time{burstCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </FadeIn>

          {/* Technical Implementation Notes */}
          <FadeIn delay={0.8} className="mt-8">
            <details className="bg-surface/20 rounded-xl p-4 border border-subtle/10">
              <summary className="cursor-pointer text-white font-medium mb-2 hover:text-brand transition-colors">
                Technical Implementation
              </summary>
              <div className="text-sm text-subtle space-y-2 mt-4">
                <p>• Built with Framer Motion spring physics (stiffness: 300, damping: 30)</p>
                <p>• Accessibility-first design with ARIA labels and keyboard navigation</p>
                <p>• Reduced motion support through useReducedMotion hook</p>
                <p>• SVG filters for playful mode &ldquo;goo&rdquo; effect</p>
                <p>• Zustand state management for persona preferences</p>
                <p>• Performance optimized with willChange and transform-only animations</p>
              </div>
            </details>
          </FadeIn>
        </div>
      </div>
    </main>
  );
}

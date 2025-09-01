"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { OtpInput } from "../../components/otp/OtpInput";
import { FadeIn, ScaleIn } from "../../components/motion/Primitives";
import { useStore, useIsDay2Complete } from "../../lib/store";
import { ScreenReader } from "../../lib/a11y";

// Mock validation function - simulates API call
const validateOtpCode = async (code: string): Promise<boolean> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Accept codes like "123456" or "000000" for demo
  return ['123456', '000000', '111111', '999999'].includes(code);
};

export default function Day2Page() {
  const { markDayComplete, preferences } = useStore();
  const isDay2Complete = useIsDay2Complete();
  const [completedCode, setCompletedCode] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleOtpComplete = (code: string) => {
    setCompletedCode(code);
    setShowSuccess(true);
    
    // Announce success
    setTimeout(() => {
      ScreenReader.announce('Day 2 challenge completed successfully!', 'polite');
    }, 500);
  };

  const resetDemo = () => {
    setCompletedCode('');
    setShowSuccess(false);
    ScreenReader.announce('Demo reset', 'polite');
  };

  return (
    <main 
      className="min-h-screen bg-app text-white overflow-hidden"
      role="main"
      aria-label="Day 2: OTP Input Challenge"
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" 
             style={{
               backgroundImage: `radial-gradient(circle at 25% 25%, var(--brand) 1px, transparent 1px)`,
               backgroundSize: '50px 50px'
             }} 
        />
      </div>

      {/* Header Navigation */}
      <header className="relative z-10 p-6">
        <nav className="flex items-center justify-between max-w-6xl mx-auto">
          <Link 
            href="/"
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
            aria-label="Back to home"
          >
            <motion.span
              whileHover={{ x: -4 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              ←
            </motion.span>
            Back to FLUX//ID
          </Link>

          <div className="flex items-center gap-4">
            {/* Day indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-surface/30 rounded-full text-sm">
              <span className="text-brand font-medium">Day 2</span>
              <span className="text-gray-400">/</span>
              <span className="text-gray-400">8</span>
              {isDay2Complete && (
                <motion.span
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-ok ml-1"
                >
                  ✓
                </motion.span>
              )}
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <div className="relative z-10 px-6 pb-16">
        <div className="max-w-2xl mx-auto">
          {/* Page Title */}
          <FadeIn delay={0.1}>
            <div className="text-center mb-16">
              <motion.h1 
                className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white via-brand to-purple-300 bg-clip-text text-transparent"
              >
                OTP Input
              </motion.h1>
              <motion.p 
                className="text-lg text-gray-400 max-w-lg mx-auto leading-relaxed"
              >
                A production-ready one-time password input with auto-advance, paste detection, 
                masked input toggle, and comprehensive accessibility features.
              </motion.p>
            </div>
          </FadeIn>

          {/* OTP Demo Section */}
          <ScaleIn delay={0.2}>
            <div className="bg-surface/20 backdrop-blur-sm rounded-2xl border border-white/10 p-8 mb-8">
              {!showSuccess ? (
                <OtpInput
                  length={6}
                  onComplete={handleOtpComplete}
                  onValidate={validateOtpCode}
                  autoFocus={true}
                  placeholder="•"
                />
              ) : (
                <div className="text-center py-8">
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="mb-6"
                  >
                    <div className="w-20 h-20 bg-gradient-to-br from-ok to-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                        className="text-3xl text-white"
                      >
                        ✓
                      </motion.span>
                    </div>
                    
                    <h3 className="text-2xl font-semibold text-white mb-2">
                      Success!
                    </h3>
                    <p className="text-gray-400 mb-4">
                      Code <span className="font-mono text-brand">{completedCode}</span> verified successfully
                    </p>
                    
                    <motion.button
                      onClick={resetDemo}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-6 py-3 bg-brand text-white rounded-lg hover:bg-brand/90 transition-colors font-medium"
                    >
                      Try Again
                    </motion.button>
                  </motion.div>
                </div>
              )}
            </div>
          </ScaleIn>

          {/* Demo Tips */}
          <FadeIn delay={0.4}>
            <div className="bg-surface/10 rounded-lg border border-white/5 p-6 mb-8">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span className="text-brand">💡</span>
                Try These Features
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-start gap-3">
                  <span className="text-brand text-xs mt-0.5">▸</span>
                  <div>
                    <strong className="text-white">Auto-advance:</strong>
                    <p className="text-gray-400">Type digits to automatically move to the next field</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <span className="text-brand text-xs mt-0.5">▸</span>
                  <div>
                    <strong className="text-white">Paste detection:</strong>
                    <p className="text-gray-400">Paste 6-digit codes like "123456" for quick entry</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <span className="text-brand text-xs mt-0.5">▸</span>
                  <div>
                    <strong className="text-white">Show/Hide toggle:</strong>
                    <p className="text-gray-400">Click the eye icon to reveal or mask digits</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <span className="text-brand text-xs mt-0.5">▸</span>
                  <div>
                    <strong className="text-white">Keyboard navigation:</strong>
                    <p className="text-gray-400">Use arrow keys, Home/End to navigate fields</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10">
                <p className="text-xs text-gray-500">
                  <strong className="text-gray-400">Demo codes:</strong> Try 123456, 000000, 111111, or 999999 for successful validation
                </p>
              </div>
            </div>
          </FadeIn>

          {/* Technical Details */}
          <FadeIn delay={0.5}>
            <div className="bg-surface/5 rounded-lg border border-white/5 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span className="text-brand">⚡</span>
                Technical Implementation
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <div>
                  <h4 className="text-white font-medium mb-2">Input Management</h4>
                  <ul className="text-gray-400 space-y-1">
                    <li>• Controlled state per cell</li>
                    <li>• Auto-advance logic</li>
                    <li>• Backspace handling</li>
                    <li>• Numeric-only input</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-white font-medium mb-2">User Experience</h4>
                  <ul className="text-gray-400 space-y-1">
                    <li>• Smooth state transitions</li>
                    <li>• Visual validation feedback</li>
                    <li>• Loading states</li>
                    <li>• Success/error animations</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-white font-medium mb-2">Accessibility</h4>
                  <ul className="text-gray-400 space-y-1">
                    <li>• Screen reader support</li>
                    <li>• Keyboard navigation</li>
                    <li>• ARIA labels</li>
                    <li>• Focus management</li>
                  </ul>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>

      {/* Navigation Footer */}
      <footer className="relative z-10 p-6 border-t border-white/10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link
            href="/day-1"
            className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white transition-colors group"
          >
            <motion.span
              whileHover={{ x: -2 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              ←
            </motion.span>
            Day 1: Avatar Stack
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Next:</span>
            <Link
              href="/day-3"
              className="flex items-center gap-2 px-4 py-2 text-brand hover:text-purple-300 transition-colors group"
            >
              Day 3: Coming Soon
              <motion.span
                whileHover={{ x: 2 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                →
              </motion.span>
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

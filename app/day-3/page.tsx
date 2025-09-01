"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { LiquidSheetTransition } from "../../components/transition/LiquidSheetTransition";
import { FadeIn } from "../../components/motion/Primitives";
import { useStore, useIsDay3Complete } from "../../lib/store";

export default function Day3Page() {
  const isDay3Complete = useIsDay3Complete();

  return (
    <main 
      className="min-h-screen bg-app text-white overflow-hidden"
      role="main"
      aria-label="Day 3: Card→Page Transition Challenge"
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" 
             style={{
               backgroundImage: `radial-gradient(circle at 75% 25%, var(--brand) 1px, transparent 1px)`,
               backgroundSize: '60px 60px'
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
              <span className="text-brand font-medium">Day 3</span>
              <span className="text-gray-400">/</span>
              <span className="text-gray-400">8</span>
              {isDay3Complete && (
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
        <LiquidSheetTransition />
      </div>

      {/* Navigation Footer */}
      <footer className="relative z-10 p-6 border-t border-white/10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link
            href="/day-2"
            className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white transition-colors group"
          >
            <motion.span
              whileHover={{ x: -2 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              ←
            </motion.span>
            Day 2: OTP Input
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Next:</span>
            <Link
              href="/day-4"
              className="flex items-center gap-2 px-4 py-2 text-brand hover:text-purple-300 transition-colors group"
            >
              Day 4: Interactive Calendar
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

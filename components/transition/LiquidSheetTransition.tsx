"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, LayoutGroup } from "framer-motion";
import { SPRING, DURATIONS, FadeIn, ScaleIn } from "../motion/Primitives";
import { useStore } from "../../lib/store";
import { 
  ARIA_LABELS, 
  ScreenReader, 
  handleKeyboardNavigation 
} from "../../lib/a11y";

// Project card data types
export interface ProjectCard {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  thumbnail: string;
  category: string;
  tags: string[];
  color: string;
  stats: {
    views: string;
    likes: string;
    comments: string;
  };
  content: {
    overview: string;
    details: string[];
    images: string[];
    features: string[];
  };
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  date: string;
}

// Sample project data
const SAMPLE_PROJECTS: ProjectCard[] = [
  {
    id: 'flux-design-system',
    title: 'FLUX Design System',
    subtitle: 'Comprehensive component library',
    description: 'A modern design system built for scalable web applications with React components and design tokens.',
    thumbnail: '🎨',
    category: 'Design System',
    tags: ['React', 'TypeScript', 'Figma', 'Storybook'],
    color: '#7C3AED',
    stats: {
      views: '12.4k',
      likes: '2.1k',
      comments: '847'
    },
    content: {
      overview: 'FLUX is a comprehensive design system that bridges the gap between design and development. Built with modern web technologies, it provides a cohesive set of components, tokens, and guidelines for creating consistent user interfaces.',
      details: [
        'Component library with 50+ React components',
        'Design tokens for colors, typography, and spacing',
        'Storybook documentation and examples',
        'Figma design kit with auto-layout components',
        'TypeScript support for type safety',
        'Accessibility-first approach with WCAG compliance'
      ],
      images: ['🖼️', '📱', '💻', '🎨'],
      features: [
        'Dark mode support',
        'Responsive components',
        'Animation primitives',
        'Icon library',
        'Form validation',
        'Data visualization'
      ]
    },
    author: {
      name: 'Sarah Chen',
      avatar: '👩‍💼',
      role: 'Senior Product Designer'
    },
    date: '2024-08-15'
  },
  {
    id: 'mobile-banking-app',
    title: 'Mobile Banking App',
    subtitle: 'Next-gen financial experience',
    description: 'Reimagined mobile banking with AI-powered insights, seamless transactions, and biometric security.',
    thumbnail: '💳',
    category: 'Mobile App',
    tags: ['React Native', 'AI', 'Fintech', 'Security'],
    color: '#06B6D4',
    stats: {
      views: '18.7k',
      likes: '3.2k',
      comments: '1.2k'
    },
    content: {
      overview: 'A revolutionary mobile banking experience that combines cutting-edge technology with intuitive design. Features AI-powered financial insights, biometric authentication, and seamless money management tools.',
      details: [
        'Biometric authentication (Face ID, Touch ID)',
        'AI-powered spending insights and budgeting',
        'Real-time transaction notifications',
        'Contactless payments and QR code support',
        'Investment portfolio management',
        'Advanced security with end-to-end encryption'
      ],
      images: ['📱', '💰', '📊', '🔒'],
      features: [
        'Voice commands',
        'Smart notifications',
        'Expense categorization',
        'Goal tracking',
        'Multi-currency support',
        'Offline mode'
      ]
    },
    author: {
      name: 'Alex Rivera',
      avatar: '👨‍💻',
      role: 'Lead Mobile Developer'
    },
    date: '2024-07-22'
  },
  {
    id: 'ecommerce-platform',
    title: 'E-commerce Platform',
    subtitle: 'Modern online shopping',
    description: 'Full-stack e-commerce solution with advanced search, AR try-on, and personalized recommendations.',
    thumbnail: '🛍️',
    category: 'Web Platform',
    tags: ['Next.js', 'AR', 'AI', 'E-commerce'],
    color: '#22C55E',
    stats: {
      views: '9.8k',
      likes: '1.7k',
      comments: '543'
    },
    content: {
      overview: 'A comprehensive e-commerce platform that revolutionizes online shopping with AR try-on features, AI-powered recommendations, and seamless checkout experiences.',
      details: [
        'AR virtual try-on for fashion and furniture',
        'AI-powered product recommendations',
        'Advanced search with visual filters',
        'One-click checkout with multiple payment options',
        'Real-time inventory management',
        'Social commerce integration'
      ],
      images: ['🛒', '👗', '🏠', '📦'],
      features: [
        'Wishlist and favorites',
        'Price tracking',
        'Reviews and ratings',
        'Live chat support',
        'Multi-vendor support',
        'Mobile-first design'
      ]
    },
    author: {
      name: 'Maya Patel',
      avatar: '👩‍🎨',
      role: 'Full-Stack Designer'
    },
    date: '2024-06-10'
  },
  {
    id: 'dashboard-analytics',
    title: 'Analytics Dashboard',
    subtitle: 'Data visualization suite',
    description: 'Comprehensive analytics dashboard with real-time data, interactive charts, and custom reports.',
    thumbnail: '📊',
    category: 'Dashboard',
    tags: ['D3.js', 'Analytics', 'Data Viz', 'Dashboard'],
    color: '#F59E0B',
    stats: {
      views: '15.3k',
      likes: '2.8k',
      comments: '921'
    },
    content: {
      overview: 'A powerful analytics dashboard that transforms complex data into actionable insights through interactive visualizations and customizable reports.',
      details: [
        'Real-time data streaming and updates',
        'Interactive charts and graphs with D3.js',
        'Custom report builder with drag-and-drop',
        'Advanced filtering and data manipulation',
        'Export capabilities (PDF, Excel, CSV)',
        'Multi-tenant architecture with role-based access'
      ],
      images: ['📈', '📉', '🎯', '📋'],
      features: [
        'Custom dashboards',
        'Automated reports',
        'Data alerts',
        'API integrations',
        'Mobile responsive',
        'Dark mode support'
      ]
    },
    author: {
      name: 'David Kim',
      avatar: '👨‍💼',
      role: 'Data Visualization Expert'
    },
    date: '2024-05-28'
  }
];

interface LiquidSheetProps {
  project: ProjectCard;
  isOpen: boolean;
  onClose: () => void;
  originRef: React.RefObject<HTMLElement>;
  className?: string;
}

function LiquidSheet({ project, isOpen, onClose, originRef, className = "" }: LiquidSheetProps) {
  const [showContent, setShowContent] = useState(false);
  const [maskCenter, setMaskCenter] = useState({ x: 50, y: 50 });
  const sheetRef = useRef<HTMLDivElement>(null);

  // Calculate mask center from origin element
  useEffect(() => {
    if (isOpen && originRef.current && sheetRef.current) {
      const origin = originRef.current.getBoundingClientRect();
      const sheet = sheetRef.current.getBoundingClientRect();
      
      const centerX = ((origin.left + origin.width / 2 - sheet.left) / sheet.width) * 100;
      const centerY = ((origin.top + origin.height / 2 - sheet.top) / sheet.height) * 100;
      
      setMaskCenter({
        x: Math.max(0, Math.min(100, centerX)),
        y: Math.max(0, Math.min(100, centerY))
      });
    }
  }, [isOpen, originRef]);

  // Handle show content timing
  useEffect(() => {
    if (isOpen) {
      // Delay content appearance for liquid wipe effect
      const timer = setTimeout(() => setShowContent(true), 400);
      return () => clearTimeout(timer);
    } else {
      setShowContent(false);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={sheetRef}
          initial={{ 
            clipPath: `circle(0% at ${maskCenter.x}% ${maskCenter.y}%)`,
            opacity: 0 
          }}
          animate={{ 
            clipPath: `circle(150% at ${maskCenter.x}% ${maskCenter.y}%)`,
            opacity: 1 
          }}
          exit={{ 
            clipPath: `circle(0% at ${maskCenter.x}% ${maskCenter.y}%)`,
            opacity: 0 
          }}
          transition={{ 
            duration: 0.6, 
            ease: [0.4, 0.0, 0.2, 1] 
          }}
          className={`
            fixed inset-0 z-50 bg-dark overflow-y-auto
            ${className}
          `}
          style={{
            background: `linear-gradient(135deg, ${project.color}10 0%, ${project.color}05 100%)`
          }}
        >
          {/* Close Button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: showContent ? 1 : 0 }}
            transition={{ delay: showContent ? 0.2 : 0 }}
            onClick={onClose}
            className="fixed top-6 right-6 z-60 w-12 h-12 bg-surface/80 backdrop-blur-sm rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-surface/90 transition-colors"
            aria-label="Close project details"
          >
            ✕
          </motion.button>

          {/* Hero Section with Shared Element */}
          <div className="relative min-h-screen flex flex-col">
            {/* Hero Background */}
            <div 
              className="absolute inset-0 opacity-10"
              style={{
                background: `radial-gradient(circle at center, ${project.color}40 0%, transparent 70%)`
              }}
            />

            {/* Content */}
            <div className="relative z-10 flex-1 p-6 md:p-12">
              <div className="max-w-4xl mx-auto">
                {/* Hero Header */}
                <motion.div 
                  className="text-center mb-12"
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: showContent ? 0 : 50, opacity: showContent ? 1 : 0 }}
                  transition={{ delay: 0.1 }}
                >
                  {/* Shared Element - Thumbnail to Hero */}
                  <motion.div
                    layoutId={`thumbnail-${project.id}`}
                    className="w-32 h-32 mx-auto mb-6 rounded-3xl flex items-center justify-center text-6xl shadow-2xl"
                    style={{ 
                      backgroundColor: project.color + '20',
                      border: `2px solid ${project.color}40`
                    }}
                  >
                    {project.thumbnail}
                  </motion.div>

                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: showContent ? 0 : 20, opacity: showContent ? 1 : 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="inline-flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full text-sm font-medium mb-4 border border-white/10">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: project.color }} />
                      {project.category}
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                      {project.title}
                    </h1>
                    
                    <p className="text-xl text-gray-300 mb-6 max-w-2xl mx-auto">
                      {project.subtitle}
                    </p>

                    <div className="flex items-center justify-center gap-6 text-sm text-gray-400">
                      <div className="flex items-center gap-2">
                        👁️ <span>{project.stats.views} views</span>
                      </div>
                      <div className="flex items-center gap-2">
                        ❤️ <span>{project.stats.likes} likes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        💬 <span>{project.stats.comments} comments</span>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>

                {/* Content Sections - Staggered In */}
                <div className="space-y-12">
                  {/* Overview */}
                  <motion.section
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: showContent ? 0 : 30, opacity: showContent ? 1 : 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white/5 rounded-2xl border border-white/10 p-8"
                  >
                    <h2 className="text-2xl font-bold text-white mb-6">Project Overview</h2>
                    <p className="text-gray-300 text-lg leading-relaxed">
                      {project.content.overview}
                    </p>
                  </motion.section>

                  {/* Tags */}
                  <motion.section
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: showContent ? 0 : 30, opacity: showContent ? 1 : 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <h3 className="text-lg font-semibold text-white mb-4">Technologies</h3>
                    <div className="flex flex-wrap gap-3">
                      {project.tags.map((tag, index) => (
                        <motion.span
                          key={tag}
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: showContent ? 1 : 0, opacity: showContent ? 1 : 0 }}
                          transition={{ delay: 0.4 + index * 0.05 }}
                          className="px-4 py-2 bg-white/10 rounded-full text-white text-sm font-medium border border-white/20"
                        >
                          {tag}
                        </motion.span>
                      ))}
                    </div>
                  </motion.section>

                  {/* Details */}
                  <motion.section
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: showContent ? 0 : 30, opacity: showContent ? 1 : 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white/5 rounded-2xl border border-white/10 p-8"
                  >
                    <h2 className="text-2xl font-bold text-white mb-6">Key Features</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {project.content.details.map((detail, index) => (
                        <motion.div
                          key={index}
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: showContent ? 0 : -20, opacity: showContent ? 1 : 0 }}
                          transition={{ delay: 0.5 + index * 0.08 }}
                          className="flex items-start gap-3 p-4 bg-white/5 rounded-lg"
                        >
                          <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: project.color }} />
                          <span className="text-gray-300">{detail}</span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.section>

                  {/* Images Gallery */}
                  <motion.section
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: showContent ? 0 : 30, opacity: showContent ? 1 : 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <h3 className="text-lg font-semibold text-white mb-6">Project Gallery</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {project.content.images.map((image, index) => (
                        <motion.div
                          key={index}
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: showContent ? 1 : 0, opacity: showContent ? 1 : 0 }}
                          transition={{ delay: 0.6 + index * 0.1 }}
                          className="aspect-square bg-white/5 rounded-xl border border-white/10 flex items-center justify-center text-4xl hover:bg-white/10 transition-colors cursor-pointer"
                        >
                          {image}
                        </motion.div>
                      ))}
                    </div>
                  </motion.section>

                  {/* Author */}
                  <motion.section
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: showContent ? 0 : 30, opacity: showContent ? 1 : 0 }}
                    transition={{ delay: 0.7 }}
                    className="bg-white/5 rounded-2xl border border-white/10 p-8"
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-2xl">
                        {project.author.avatar}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">{project.author.name}</h3>
                        <p className="text-gray-400">{project.author.role}</p>
                        <p className="text-gray-500 text-sm mt-1">Published on {new Date(project.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </motion.section>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface LiquidSheetTransitionProps {
  className?: string;
}

export function LiquidSheetTransition({ className = "" }: LiquidSheetTransitionProps) {
  const { markDayComplete, preferences } = useStore();
  
  // Component state
  const [selectedProject, setSelectedProject] = useState<ProjectCard | null>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement>>({});

  // Handle card click
  const handleCardClick = useCallback((project: ProjectCard) => {
    setSelectedProject(project);
    markDayComplete(3);
    ScreenReader.announce(`Opened ${project.title} project details`, 'polite');
  }, [markDayComplete]);

  // Close project details
  const handleClose = useCallback(() => {
    setSelectedProject(null);
    ScreenReader.announce('Closed project details', 'polite');
  }, []);

  return (
    <div className={`max-w-6xl mx-auto ${className}`}>
      <FadeIn className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-brand/10 text-brand px-4 py-2 rounded-full text-sm font-medium mb-6">
          🌊 Day 3
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">
          Card→Page Transition ("Liquid Sheet")
        </h1>
        <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
          Experience seamless transitions from project cards to full pages with shared element morphing, 
          liquid radial masks, and staggered content animations.
        </p>
      </FadeIn>

      {/* Project Cards Grid */}
      <LayoutGroup>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {SAMPLE_PROJECTS.map((project, index) => (
            <motion.div
              key={project.id}
              ref={(el) => {
                if (el) cardRefs.current[project.id] = el;
              }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15, ...SPRING }}
              className="group cursor-pointer"
              onClick={() => handleCardClick(project)}
              whileHover={{ y: -8 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="bg-surface/10 rounded-2xl border border-white/10 p-6 h-full transition-all duration-300 group-hover:border-white/30 group-hover:shadow-2xl">
                {/* Card Header */}
                <div className="flex items-start gap-4 mb-6">
                  {/* Shared Element - Thumbnail */}
                  <motion.div
                    layoutId={`thumbnail-${project.id}`}
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl shadow-lg flex-shrink-0"
                    style={{ 
                      backgroundColor: project.color + '20',
                      border: `2px solid ${project.color}40`
                    }}
                  >
                    {project.thumbnail}
                  </motion.div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: project.color }} />
                      <span className="text-gray-400 text-xs font-medium uppercase tracking-wide">
                        {project.category}
                      </span>
                    </div>
                    <h2 className="text-white text-xl font-bold mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 group-hover:bg-clip-text transition-all">
                      {project.title}
                    </h2>
                    <p className="text-gray-400 text-sm">
                      {project.subtitle}
                    </p>
                  </div>
                </div>

                {/* Card Description */}
                <p className="text-gray-300 text-sm mb-6 line-clamp-3">
                  {project.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {project.tags.slice(0, 3).map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-white/10 rounded-md text-gray-300 text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                  {project.tags.length > 3 && (
                    <span className="px-2 py-1 text-gray-500 text-xs">
                      +{project.tags.length - 3} more
                    </span>
                  )}
                </div>

                {/* Card Footer */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>👁️ {project.stats.views}</span>
                    <span>❤️ {project.stats.likes}</span>
                    <span>💬 {project.stats.comments}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span>{project.author.avatar}</span>
                    <span>{project.author.name}</span>
                  </div>
                </div>

                {/* Hover Indicator */}
                <div className="mt-4 pt-4 border-t border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex items-center justify-center text-sm text-gray-400">
                    <span>Click to view details</span>
                    <motion.span
                      className="ml-2"
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      →
                    </motion.span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </LayoutGroup>

      {/* Instructions */}
      <ScaleIn delay={0.8} className="text-center">
        <div className="bg-brand/5 border border-brand/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Transition Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-400">
            <div>
              • <strong className="text-white">Shared Element</strong> - Thumbnail morphs into hero image
            </div>
            <div>
              • <strong className="text-white">Liquid Wipe</strong> - Radial mask expands from card origin
            </div>
            <div>
              • <strong className="text-white">Content Stagger</strong> - Elements animate in sequentially
            </div>
          </div>
        </div>
      </ScaleIn>

      {/* Liquid Sheet Overlay */}
      <LiquidSheet
        project={selectedProject!}
        isOpen={selectedProject !== null}
        onClose={handleClose}
        originRef={{ current: selectedProject ? cardRefs.current[selectedProject.id] : null }}
      />
    </div>
  );
}
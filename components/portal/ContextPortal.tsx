"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { SPRING, DURATIONS, FadeIn, ScaleIn } from "../motion/Primitives";
import { useStore } from "../../lib/store";
import { 
  ARIA_LABELS, 
  ScreenReader, 
  handleKeyboardNavigation 
} from "../../lib/a11y";

// Portal context types
export type PortalContext = 
  | 'dashboard' 
  | 'projects' 
  | 'team' 
  | 'settings' 
  | 'analytics' 
  | 'messages'
  | 'calendar'
  | 'files';

export interface PortalButton {
  id: string;
  label: string;
  icon: string;
  context: PortalContext;
  description: string;
  color: string;
  x: number;
  y: number;
}

export interface ContextData {
  title: string;
  subtitle: string;
  content: React.ReactNode;
  actions: Array<{
    label: string;
    icon: string;
    onClick: () => void;
  }>;
  stats?: Array<{
    label: string;
    value: string;
    trend?: 'up' | 'down';
  }>;
}

interface WarpOverlayProps {
  isOpen: boolean;
  originButton: PortalButton | null;
  context: PortalContext | null;
  onClose: () => void;
  className?: string;
}

function WarpOverlay({ isOpen, originButton, context, onClose, className = "" }: WarpOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [rippleCenter, setRippleCenter] = useState({ x: 50, y: 50 });
  const [showContent, setShowContent] = useState(false);
  
  // Ripple animation values
  const rippleScale = useMotionValue(0);
  const rippleOpacity = useMotionValue(0);

  // Context data mapping
  const contextData: Record<PortalContext, ContextData> = {
    dashboard: {
      title: "Dashboard Overview",
      subtitle: "Your personalized workspace",
      content: (
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white/5 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {['Project Alpha updated', 'New team member joined', 'Deployment completed'].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-gray-300 text-sm">
                  <div className="w-2 h-2 bg-brand rounded-full"></div>
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white/5 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              {['Create', 'Import', 'Share', 'Export'].map((action, i) => (
                <button key={i} className="p-3 bg-brand/20 hover:bg-brand/30 rounded-lg text-white text-sm transition-colors">
                  {action}
                </button>
              ))}
            </div>
          </div>
        </div>
      ),
      actions: [
        { label: 'View All', icon: '👁️', onClick: () => console.log('View all') },
        { label: 'Customize', icon: '⚙️', onClick: () => console.log('Customize') }
      ],
      stats: [
        { label: 'Active Projects', value: '12', trend: 'up' },
        { label: 'Team Members', value: '8', trend: 'up' },
        { label: 'Tasks Done', value: '47', trend: 'up' }
      ]
    },
    projects: {
      title: "Projects Hub",
      subtitle: "Manage your creative work",
      content: (
        <div className="grid grid-cols-1 gap-4">
          {[
            { name: 'FLUX Design System', status: 'In Progress', progress: 75 },
            { name: 'Mobile App Redesign', status: 'Planning', progress: 25 },
            { name: 'API Documentation', status: 'Completed', progress: 100 }
          ].map((project, i) => (
            <div key={i} className="bg-white/5 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-medium text-white">{project.name}</h3>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  project.status === 'Completed' ? 'bg-ok/20 text-ok' :
                  project.status === 'In Progress' ? 'bg-brand/20 text-brand' :
                  'bg-warning/20 text-warning'
                }`}>
                  {project.status}
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div 
                  className="h-full bg-gradient-to-r from-brand to-ok rounded-full transition-all duration-500"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      ),
      actions: [
        { label: 'New Project', icon: '➕', onClick: () => console.log('New project') },
        { label: 'Templates', icon: '📋', onClick: () => console.log('Templates') }
      ]
    },
    team: {
      title: "Team Collaboration",
      subtitle: "Connect with your colleagues",
      content: (
        <div className="grid grid-cols-2 gap-4">
          {[
            { name: 'Sarah Chen', role: 'Product Designer', status: 'online', avatar: '👩‍💼' },
            { name: 'Mike Johnson', role: 'Developer', status: 'busy', avatar: '👨‍💻' },
            { name: 'Lisa Park', role: 'PM', status: 'away', avatar: '👩‍💼' },
            { name: 'Tom Wilson', role: 'Designer', status: 'offline', avatar: '👨‍🎨' }
          ].map((member, i) => (
            <div key={i} className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="text-2xl">{member.avatar}</div>
                <div className="flex-1">
                  <h3 className="font-medium text-white text-sm">{member.name}</h3>
                  <p className="text-gray-400 text-xs">{member.role}</p>
                </div>
                <div className={`w-3 h-3 rounded-full ${
                  member.status === 'online' ? 'bg-ok' :
                  member.status === 'busy' ? 'bg-error' :
                  member.status === 'away' ? 'bg-warning' :
                  'bg-gray-500'
                }`} />
              </div>
            </div>
          ))}
        </div>
      ),
      actions: [
        { label: 'Invite', icon: '👥', onClick: () => console.log('Invite') },
        { label: 'Chat', icon: '💬', onClick: () => console.log('Chat') }
      ]
    },
    settings: {
      title: "Settings & Preferences",
      subtitle: "Customize your experience",
      content: (
        <div className="space-y-4">
          {[
            { label: 'Theme', value: 'Dark Mode', icon: '🌙' },
            { label: 'Language', value: 'English', icon: '🌐' },
            { label: 'Notifications', value: 'Enabled', icon: '🔔' },
            { label: 'Privacy', value: 'Friends Only', icon: '🔒' }
          ].map((setting, i) => (
            <div key={i} className="bg-white/5 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-lg">{setting.icon}</span>
                <span className="text-white font-medium">{setting.label}</span>
              </div>
              <span className="text-gray-400 text-sm">{setting.value}</span>
            </div>
          ))}
        </div>
      ),
      actions: [
        { label: 'Advanced', icon: '⚙️', onClick: () => console.log('Advanced') },
        { label: 'Export', icon: '📤', onClick: () => console.log('Export') }
      ]
    },
    analytics: {
      title: "Analytics Dashboard",
      subtitle: "Performance insights",
      content: (
        <div className="grid grid-cols-3 gap-4">
          {[
            { metric: 'Page Views', value: '2,847', change: '+12%' },
            { metric: 'Users', value: '1,234', change: '+8%' },
            { metric: 'Bounce Rate', value: '24%', change: '-5%' },
            { metric: 'Conversion', value: '3.4%', change: '+15%' },
            { metric: 'Revenue', value: '$12,450', change: '+22%' },
            { metric: 'Sessions', value: '4,567', change: '+18%' }
          ].map((stat, i) => (
            <div key={i} className="bg-white/5 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-gray-400 text-xs mb-2">{stat.metric}</div>
              <div className="text-ok text-xs">{stat.change}</div>
            </div>
          ))}
        </div>
      ),
      actions: [
        { label: 'Export', icon: '📊', onClick: () => console.log('Export') },
        { label: 'Schedule', icon: '📅', onClick: () => console.log('Schedule') }
      ]
    },
    messages: {
      title: "Messages",
      subtitle: "Stay connected",
      content: (
        <div className="space-y-3">
          {[
            { sender: 'Sarah Chen', message: 'Hey, can you review the new designs?', time: '2m ago', unread: true },
            { sender: 'Mike Johnson', message: 'The API endpoints are ready for testing', time: '15m ago', unread: true },
            { sender: 'Lisa Park', message: 'Great work on the presentation!', time: '1h ago', unread: false },
            { sender: 'Tom Wilson', message: 'Let\'s sync up tomorrow morning', time: '2h ago', unread: false }
          ].map((msg, i) => (
            <div key={i} className={`bg-white/5 rounded-lg p-4 ${msg.unread ? 'border-l-2 border-brand' : ''}`}>
              <div className="flex justify-between items-start mb-2">
                <span className="font-medium text-white text-sm">{msg.sender}</span>
                <span className="text-gray-500 text-xs">{msg.time}</span>
              </div>
              <p className="text-gray-300 text-sm">{msg.message}</p>
            </div>
          ))}
        </div>
      ),
      actions: [
        { label: 'Compose', icon: '✏️', onClick: () => console.log('Compose') },
        { label: 'Archive', icon: '📁', onClick: () => console.log('Archive') }
      ]
    },
    calendar: {
      title: "Calendar",
      subtitle: "Manage your schedule",
      content: (
        <div className="space-y-4">
          <div className="bg-white/5 rounded-lg p-4">
            <h3 className="text-white font-medium mb-3">Today&apos;s Events</h3>
            <div className="space-y-2">
              {[
                { time: '9:00 AM', event: 'Team Standup', color: 'bg-brand' },
                { time: '11:30 AM', event: 'Design Review', color: 'bg-ok' },
                { time: '2:00 PM', event: 'Client Call', color: 'bg-warning' },
                { time: '4:30 PM', event: 'Sprint Planning', color: 'bg-error' }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-3 h-3 ${item.color} rounded-full`} />
                  <span className="text-gray-400 text-sm w-16">{item.time}</span>
                  <span className="text-white text-sm">{item.event}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
      actions: [
        { label: 'Add Event', icon: '➕', onClick: () => console.log('Add event') },
        { label: 'View Week', icon: '📅', onClick: () => console.log('View week') }
      ]
    },
    files: {
      title: "File Manager",
      subtitle: "Organize your documents",
      content: (
        <div className="grid grid-cols-2 gap-4">
          {[
            { name: 'Design Assets', type: 'folder', size: '12 files', icon: '📁' },
            { name: 'project-spec.pdf', type: 'pdf', size: '2.4 MB', icon: '📄' },
            { name: 'wireframes.fig', type: 'figma', size: '8.1 MB', icon: '🎨' },
            { name: 'presentation.key', type: 'keynote', size: '15.3 MB', icon: '📊' }
          ].map((file, i) => (
            <div key={i} className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{file.icon}</span>
                <div className="flex-1">
                  <h3 className="text-white text-sm font-medium truncate">{file.name}</h3>
                  <p className="text-gray-400 text-xs">{file.size}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ),
      actions: [
        { label: 'Upload', icon: '⬆️', onClick: () => console.log('Upload') },
        { label: 'Search', icon: '🔍', onClick: () => console.log('Search') }
      ]
    }
  };

  // Calculate ripple position from origin button
  useEffect(() => {
    if (originButton && overlayRef.current) {
      const overlay = overlayRef.current.getBoundingClientRect();
      const centerX = ((originButton.x - overlay.left) / overlay.width) * 100;
      const centerY = ((originButton.y - overlay.top) / overlay.height) * 100;
      
      setRippleCenter({
        x: Math.max(0, Math.min(100, centerX)),
        y: Math.max(0, Math.min(100, centerY))
      });
    }
  }, [originButton]);

  // Animate ripple effect
  useEffect(() => {
    if (isOpen) {
      // Ripple expansion
      rippleScale.set(0);
      rippleOpacity.set(0.8);
      
      const animation = rippleScale.set(150);
      setTimeout(() => {
        rippleOpacity.set(0);
        setShowContent(true);
      }, 400);
    } else {
      // Ripple collapse
      setShowContent(false);
      rippleOpacity.set(0.5);
      rippleScale.set(0);
    }
  }, [isOpen, rippleScale, rippleOpacity]);

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

  if (!context || !originButton) return null;

  const data = contextData[context];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with blur */}
          <motion.div
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(8px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/30 z-40"
            onClick={onClose}
          />

          {/* Warp Overlay */}
          <motion.div
            ref={overlayRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 z-50 pointer-events-none ${className}`}
          >
            {/* Ripple Effect */}
            <motion.div
              className="absolute inset-0 overflow-hidden"
              style={{
                background: `radial-gradient(circle at ${rippleCenter.x}% ${rippleCenter.y}%, ${originButton.color}20 0%, transparent 70%)`
              }}
            >
              <motion.div
                className="absolute rounded-full"
                style={{
                  left: `${rippleCenter.x}%`,
                  top: `${rippleCenter.y}%`,
                  width: '20px',
                  height: '20px',
                  marginLeft: '-10px',
                  marginTop: '-10px',
                  background: `radial-gradient(circle, ${originButton.color}40 0%, ${originButton.color}20 50%, transparent 100%)`,
                  scale: rippleScale,
                  opacity: rippleOpacity
                }}
              />
            </motion.div>

            {/* Content Portal */}
            <AnimatePresence>
              {showContent && (
                <motion.div
                  initial={{ 
                    opacity: 0, 
                    scale: 0.8,
                    x: originButton.x - window.innerWidth / 2,
                    y: originButton.y - window.innerHeight / 2
                  }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1,
                    x: 0,
                    y: 0
                  }}
                  exit={{ 
                    opacity: 0, 
                    scale: 0.8,
                    x: originButton.x - window.innerWidth / 2,
                    y: originButton.y - window.innerHeight / 2
                  }}
                  transition={{ ...SPRING, duration: 0.4 }}
                  className="absolute inset-4 md:inset-8 lg:inset-16 pointer-events-auto"
                >
                  <div className="w-full h-full bg-surface/95 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-white/10">
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                          style={{ backgroundColor: originButton.color + '20' }}
                        >
                          {originButton.icon}
                        </div>
                        <div>
                          <h1 className="text-xl font-bold text-white">{data.title}</h1>
                          <p className="text-gray-400 text-sm">{data.subtitle}</p>
                        </div>
                      </div>
                      
                      <motion.button
                        onClick={onClose}
                        className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        aria-label="Close portal"
                      >
                        ✕
                      </motion.button>
                    </div>

                    {/* Stats (if available) */}
                    {data.stats && (
                      <div className="p-6 border-b border-white/10">
                        <div className="grid grid-cols-3 gap-4">
                          {data.stats.map((stat, index) => (
                            <div key={index} className="text-center">
                              <div className="text-2xl font-bold text-white mb-1">
                                {stat.value}
                              </div>
                              <div className="text-gray-400 text-sm">
                                {stat.label}
                              </div>
                              {stat.trend && (
                                <div className={`text-xs ${stat.trend === 'up' ? 'text-ok' : 'text-error'}`}>
                                  {stat.trend === 'up' ? '↗' : '↘'} Trending {stat.trend}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Content */}
                    <div className="p-6 flex-1 overflow-y-auto">
                      {data.content}
                    </div>

                    {/* Actions */}
                    <div className="p-6 border-t border-white/10">
                      <div className="flex items-center gap-3">
                        {data.actions.map((action, index) => (
                          <motion.button
                            key={index}
                            onClick={action.onClick}
                            className="flex items-center gap-2 px-4 py-2 bg-brand hover:bg-brand/80 text-white rounded-lg transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <span>{action.icon}</span>
                            <span className="text-sm font-medium">{action.label}</span>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

interface ContextPortalProps {
  className?: string;
}

export function ContextPortal({ className = "" }: ContextPortalProps) {
  const { markDayComplete, preferences } = useStore();
  
  // Portal state
  const [activePortal, setActivePortal] = useState<{
    button: PortalButton;
    context: PortalContext;
  } | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Portal buttons configuration
  const portalButtons: PortalButton[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: '📊',
      context: 'dashboard',
      description: 'Overview and quick actions',
      color: '#7C3AED',
      x: 200,
      y: 150
    },
    {
      id: 'projects',
      label: 'Projects',
      icon: '🚀',
      context: 'projects',
      description: 'Manage your creative work',
      color: '#06B6D4',
      x: 450,
      y: 200
    },
    {
      id: 'team',
      label: 'Team',
      icon: '👥',
      context: 'team',
      description: 'Collaborate with colleagues',
      color: '#22C55E',
      x: 150,
      y: 350
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: '📈',
      context: 'analytics',
      description: 'Performance insights',
      color: '#F59E0B',
      x: 650,
      y: 180
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: '💬',
      context: 'messages',
      description: 'Stay connected',
      color: '#EF4444',
      x: 350,
      y: 400
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: '📅',
      context: 'calendar',
      description: 'Manage your schedule',
      color: '#8B5CF6',
      x: 550,
      y: 350
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: '⚙️',
      context: 'settings',
      description: 'Customize experience',
      color: '#10B981',
      x: 750,
      y: 320
    },
    {
      id: 'files',
      label: 'Files',
      icon: '📁',
      context: 'files',
      description: 'Document management',
      color: '#F97316',
      x: 400,
      y: 280
    }
  ];

  // Handle portal button click
  const handlePortalClick = useCallback((button: PortalButton, event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const updatedButton = {
      ...button,
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };
    
    setActivePortal({
      button: updatedButton,
      context: button.context
    });
    
    // Mark day complete on first portal open
    markDayComplete(6);
    
    ScreenReader.announce(`Opened ${button.label} portal`, 'polite');
  }, [markDayComplete]);

  // Close portal
  const handleClosePortal = useCallback(() => {
    setActivePortal(null);
    ScreenReader.announce('Portal closed', 'polite');
  }, []);

  return (
    <div className={`max-w-6xl mx-auto ${className}`}>
      <FadeIn className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-brand/10 text-brand px-4 py-2 rounded-full text-sm font-medium mb-6">
          🌀 Day 6
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">
          Warp Overlay (&ldquo;Context Portal&rdquo;)
        </h1>
        <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
          Click any Portal button to experience seamless context switching with 
          warp overlays, depth blur effects, and graceful origin-based transitions.
        </p>
      </FadeIn>

      {/* Portal Playground */}
      <ScaleIn delay={0.2} className="mb-12">
        <div 
          ref={containerRef}
          className="relative bg-gradient-to-br from-surface/20 to-surface/5 rounded-2xl border border-white/10 p-8 min-h-[500px] overflow-hidden"
        >
          {/* Background Grid */}
          <div className="absolute inset-0 opacity-10">
            <div className="grid grid-cols-12 gap-4 h-full">
              {Array.from({ length: 48 }).map((_, i) => (
                <div key={i} className="border border-white/20" />
              ))}
            </div>
          </div>

          {/* Portal Buttons */}
          {portalButtons.map((button, index) => (
            <motion.button
              key={button.id}
              className="absolute group"
              style={{
                left: `${(button.x / 800) * 100}%`,
                top: `${(button.y / 500) * 100}%`,
                transform: 'translate(-50%, -50%)'
              }}
              onClick={(e) => handlePortalClick(button, e)}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1, ...SPRING }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <div 
                className="w-16 h-16 rounded-2xl border-2 flex items-center justify-center text-2xl shadow-lg backdrop-blur-sm transition-all duration-200 group-hover:shadow-xl"
                style={{ 
                  backgroundColor: button.color + '20',
                  borderColor: button.color + '40',
                  boxShadow: `0 4px 20px ${button.color}30`
                }}
              >
                {button.icon}
              </div>
              
              {/* Label */}
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="bg-surface/90 backdrop-blur-sm px-3 py-1 rounded-lg border border-white/20">
                  <div className="text-white text-sm font-medium">{button.label}</div>
                  <div className="text-gray-400 text-xs">{button.description}</div>
                </div>
              </div>
            </motion.button>
          ))}

          {/* Connection Lines (decorative) */}
          <svg className="absolute inset-0 pointer-events-none opacity-20">
            {portalButtons.map((button, index) => {
              const nextButton = portalButtons[(index + 1) % portalButtons.length];
              return (
                <motion.line
                  key={`line-${index}`}
                  x1={`${(button.x / 800) * 100}%`}
                  y1={`${(button.y / 500) * 100}%`}
                  x2={`${(nextButton.x / 800) * 100}%`}
                  y2={`${(nextButton.y / 500) * 100}%`}
                  stroke={button.color}
                  strokeWidth="1"
                  strokeDasharray="5,5"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: index * 0.2, duration: 1 }}
                />
              );
            })}
          </svg>
        </div>
      </ScaleIn>

      {/* Instructions */}
      <ScaleIn delay={0.4} className="text-center mb-8">
        <div className="bg-brand/5 border border-brand/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Portal Navigation</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-400">
            <div>
              • <strong className="text-white">Click portal buttons</strong> to warp to different contexts
            </div>
            <div>
              • <strong className="text-white">Watch the ripple effect</strong> expand from the button origin
            </div>
            <div>
              • <strong className="text-white">Close with X button</strong> or press Escape key
            </div>
            <div>
              • <strong className="text-white">Graceful collapse</strong> returns to the original position
            </div>
          </div>
        </div>
      </ScaleIn>

      {/* Warp Overlay */}
      <WarpOverlay
        isOpen={activePortal !== null}
        originButton={activePortal?.button || null}
        context={activePortal?.context || null}
        onClose={handleClosePortal}
      />
    </div>
  );
}
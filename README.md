# FLUX//ID - Interactive Design Challenges

Eight cohesive interaction challenges built with Next.js 14, showcasing pixel-perfect animations, accessibility-first design, and 60fps performance.

## 🚀 Live Demo

- **Production**: [Vercel Deploy URL]
- **Judge Mode**: [URL]/judge for performance monitoring and testing controls

## 📋 Challenge Overview

| Day | Challenge | Status | Features |
|-----|-----------|--------|----------|
| 1   | Animated Avatar Stack | ✅ Complete | Professional/Playful/Minimal modes, hover effects, burst animation |
| 2   | Interactive OTP Input | ✅ Complete | Auto-advance, paste detection, masked/unmasked toggle, validation |
| 3   | Card → Page Transition | 🚧 Planned | Shared element morphing, liquid page wipes |
| 4   | Interactive Folder | 🚧 Planned | Drag interactions, realistic physics |
| 5   | Progressive Input Stack | 🚧 Planned | Multi-step form, contextual progress |
| 6   | Warp Overlay Effect | 🚧 Planned | WebGL distortion, CSS fallback |
| 7   | AI Autofill Animation | 🚧 Planned | Staged loading, believable micro-copy |
| 8   | Identity Board Synthesis | 🚧 Planned | Collect, arrange, export identity |

## 🛠 Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom design tokens
- **Animation**: Framer Motion
- **State**: Zustand with persistence
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React
- **Export**: html2canvas + jsPDF

## 🎨 Design System

### Colors
- --brand: #7C3AED (Primary purple)
- --ink: #0F172A (Text)
- --subtle: #8E8EA0 (Secondary text)
- --surface: #0B1020 (Background)
- --accent: #06B6D4 (Cyan)
- --ok: #22C55E (Success)
- --warn: #F59E0B (Warning)
- --danger: #EF4444 (Error)

### Motion Language
- **Spring**: { stiffness: 300, damping: 30 }
- **Durations**: 140-320ms
- **Easing**: cubic-bezier(0.4, 0.0, 0.2, 1)

## 🏃‍♂️ Quick Start

`ash
# Clone and install
git clone <repository>
cd flux-id
npm install

# Development
npm run dev

# Build for production
npm run build
npm start
`

## 🎯 Project Structure

`
app/
├── layout.tsx              # Root layout with metadata
├── page.tsx               # Landing page
├── all/page.tsx           # Scrollytelling experience
├── judge/page.tsx         # Performance monitoring
└── day-[1-8]/page.tsx     # Individual challenge pages

components/
├── motion/Primitives.tsx   # Framer Motion primitives
├── avatar/AvatarStack.tsx  # Day 1 component
├── otp/OtpInput.tsx       # Day 2 component
└── [other components]     # Days 3-8 components

lib/
├── state.ts               # Zustand store
└── a11y.ts               # Accessibility utilities
`

## ♿ Accessibility Features

- **Keyboard Navigation**: Tab/Arrow keys for all interactions
- **Screen Reader**: Announcements for state changes
- **Focus Management**: Visible indicators and logical order
- **Color Safety**: Color-blind friendly combinations
- **Motion**: Respects prefers-reduced-motion
- **Contrast**: High contrast mode support

## ⚡ Performance Guarantees

- **60fps**: Transform/opacity-based animations
- **No CLS**: Cumulative Layout Shift prevention
- **LCP < 2.5s**: Optimized loading on mobile
- **SSR**: Server-side rendering for SEO
- **Code Splitting**: Lazy loading of heavy components

## 🧪 Testing Checklist

### Day 1 - Avatar Stack
- [ ] Hover individual avatars for tilt effects
- [ ] Tab navigation between avatars
- [ ] Enter key triggers burst animation
- [ ] Mode switching (Professional/Playful/Minimal)
- [ ] Accessibility announcements

### Day 2 - OTP Input
- [ ] Auto-advance on digit entry
- [ ] Paste detection (try "123456")
- [ ] Backspace navigation
- [ ] Show/hide toggle
- [ ] Success state (123456) and error states
- [ ] Screen reader announcements

### Judge Mode Controls
- [ ] FPS counter displays current framerate
- [ ] Reduce Motion toggle disables animations
- [ ] Disable Shaders fallback
- [ ] Show Focus Outlines for accessibility testing

## 📱 Responsive Breakpoints

- **Mobile**: 0-768px
- **Tablet**: 768-1024px
- **Desktop**: 1024px+

## 🎬 Demo Script (Loom)

1. **Landing (0:00-0:15)**: Show hero animation and challenge grid
2. **Day 1 (0:15-0:45)**: Demonstrate avatar modes, hover, burst
3. **Day 2 (0:45-1:15)**: OTP paste, validation, accessibility
4. **All Page (1:15-1:30)**: Scrollytelling with progress rail
5. **Judge Mode (1:30-2:00)**: Performance monitoring, controls

## 🚢 Deployment

`ash
# Vercel deployment
npm run build
vercel --prod

# Environment variables (if needed)
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
`

## 📄 License

MIT License - Feel free to use this project as inspiration for your own interaction challenges.

---

**Built with ❤️ for the modern web**

// Accessibility utilities for FLUX//ID
export const ARIA_LABELS = {
  // Avatar Stack
  avatarStack: 'Interactive avatar stack with hover and keyboard navigation',
  avatarItem: (name: string, role: string, index: number, total: number) => 
    `Avatar ${index + 1} of ${total}: ${name}, ${role}. Press Enter or Space to trigger animation.`,
  
  // OTP
  otpInput: 'One-time password input field',
  otpCell: (index: number, value: string, total: number) =>
    `Digit ${index + 1} of ${total}${value ? `: ${value}` : ', empty'}`,
  
  // General
  loading: 'Loading content',
  error: 'Error occurred',
  success: 'Action completed successfully'
} as const

export const ARIA_LIVE_REGIONS = {
  polite: 'polite',
  assertive: 'assertive',
  off: 'off'
} as const

// Screen reader announcements
export class ScreenReader {
  private static announcement: HTMLDivElement | null = null
  
  static announce(message: string, priority: 'polite' | 'assertive' = 'polite') {
    if (!this.announcement) {
      this.announcement = document.createElement('div')
      this.announcement.setAttribute('aria-live', priority)
      this.announcement.setAttribute('aria-atomic', 'true')
      this.announcement.className = 'sr-only'
      document.body.appendChild(this.announcement)
    }
    
    this.announcement.setAttribute('aria-live', priority)
    this.announcement.textContent = message
    
    // Clear after announcement to allow repeated announcements
    setTimeout(() => {
      if (this.announcement) {
        this.announcement.textContent = ''
      }
    }, 1000)
  }
}

// Focus management utilities
export class FocusManager {
  private static focusStack: HTMLElement[] = []
  
  static trapFocus(element: HTMLElement) {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>
    
    if (focusableElements.length === 0) return
    
    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]
    
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    }
    
    element.addEventListener('keydown', handleTabKey)
    firstElement.focus()
    
    return () => {
      element.removeEventListener('keydown', handleTabKey)
    }
  }
  
  static saveFocus() {
    const activeElement = document.activeElement as HTMLElement
    if (activeElement) {
      this.focusStack.push(activeElement)
    }
  }
  
  static restoreFocus() {
    const element = this.focusStack.pop()
    if (element && element.focus) {
      element.focus()
    }
  }
}

// Keyboard navigation helpers
export const KEYS = {
  ENTER: 'Enter',
  SPACE: ' ',
  ESCAPE: 'Escape',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  TAB: 'Tab',
  HOME: 'Home',
  END: 'End'
} as const

export function handleKeyboardNavigation(
  event: React.KeyboardEvent,
  options: {
    onEnter?: () => void
    onSpace?: () => void
    onEscape?: () => void
    onArrowUp?: () => void
    onArrowDown?: () => void
    onArrowLeft?: () => void
    onArrowRight?: () => void
    onHome?: () => void
    onEnd?: () => void
    preventDefault?: boolean
  }
) {
  const { preventDefault = true } = options
  
  switch (event.key) {
    case KEYS.ENTER:
      if (options.onEnter) {
        if (preventDefault) event.preventDefault()
        options.onEnter()
      }
      break
    case KEYS.SPACE:
      if (options.onSpace) {
        if (preventDefault) event.preventDefault()
        options.onSpace()
      }
      break
    case KEYS.ESCAPE:
      if (options.onEscape) {
        if (preventDefault) event.preventDefault()
        options.onEscape()
      }
      break
    case KEYS.ARROW_UP:
      if (options.onArrowUp) {
        if (preventDefault) event.preventDefault()
        options.onArrowUp()
      }
      break
    case KEYS.ARROW_DOWN:
      if (options.onArrowDown) {
        if (preventDefault) event.preventDefault()
        options.onArrowDown()
      }
      break
    case KEYS.ARROW_LEFT:
      if (options.onArrowLeft) {
        if (preventDefault) event.preventDefault()
        options.onArrowLeft()
      }
      break
    case KEYS.ARROW_RIGHT:
      if (options.onArrowRight) {
        if (preventDefault) event.preventDefault()
        options.onArrowRight()
      }
      break
    case KEYS.HOME:
      if (options.onHome) {
        if (preventDefault) event.preventDefault()
        options.onHome()
      }
      break
    case KEYS.END:
      if (options.onEnd) {
        if (preventDefault) event.preventDefault()
        options.onEnd()
      }
      break
  }
}

// Reduced motion detection
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// High contrast detection
export function prefersHighContrast(): boolean {
  return window.matchMedia('(prefers-contrast: high)').matches
}

// Skip link component for keyboard navigation
export function createSkipLink(targetId: string, label: string = 'Skip to main content') {
  return {
    href: `#${targetId}`,
    className: 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-brand text-white px-4 py-2 rounded-lg z-50 transition-all',
    children: label,
    onFocus: () => ScreenReader.announce(`Skip link focused: ${label}`, 'polite')
  }
}
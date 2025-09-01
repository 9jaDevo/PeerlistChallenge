import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Types
export type PersonaMode = 'professional' | 'playful' | 'minimal'

export type Persona = {
  mode: PersonaMode
  colors: string[]
}

export type Profile = {
  name: string
  role: string
  avatarSeed: string
  verified: boolean
  links: string[]
}

export type FolderItem = {
  id: string
  name: string
  type: 'img' | 'doc' | 'link'
  url?: string
}

export type Store = {
  // Persona state
  persona: Persona
  setPersona: (p: Partial<Persona>) => void
  
  // Profile state
  profile: Profile
  setProfile: (p: Partial<Profile>) => void
  
  // Folder items
  folderItems: FolderItem[]
  addFolderItem: (item: FolderItem) => void
  removeFolderItem: (id: string) => void
  
  // Form data
  formData: Record<string, string>
  setFormData: (data: Partial<Record<string, string>>) => void
  
  // AI status
  aiStatus: 'idle' | 'fetching' | 'ready'
  setAiStatus: (status: 'idle' | 'fetching' | 'ready') => void
  
  // App preferences
  preferences: {
    reduceMotion: boolean
    disableShaders: boolean
    theme: 'light' | 'dark' | 'brand'
    soundEnabled: boolean
  }
  setPreferences: (prefs: Partial<Store['preferences']>) => void
  
  // Progress tracking
  completedDays: number[]
  markDayComplete: (day: number) => void
  
  // Reset all data
  reset: () => void
}

const initialState = {
  persona: {
    mode: 'professional' as PersonaMode,
    colors: ['#7C3AED', '#06B6D4', '#22C55E', '#F59E0B', '#EF4444']
  },
  profile: {
    name: '',
    role: '',
    avatarSeed: '',
    verified: false,
    links: []
  },
  folderItems: [],
  formData: {},
  aiStatus: 'idle' as const,
  preferences: {
    reduceMotion: false,
    disableShaders: false,
    theme: 'dark' as const,
    soundEnabled: false
  },
  completedDays: []
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      setPersona: (p) =>
        set((state) => ({ persona: { ...state.persona, ...p } })),
      
      setProfile: (p) =>
        set((state) => ({ profile: { ...state.profile, ...p } })),
      
      addFolderItem: (item) =>
        set((state) => ({
          folderItems: [...state.folderItems.filter(i => i.id !== item.id), item]
        })),
      
      removeFolderItem: (id) =>
        set((state) => ({
          folderItems: state.folderItems.filter(i => i.id !== id)
        })),
      
  setFormData: (data) =>
    set((state) => ({ 
      formData: { ...state.formData, ...Object.fromEntries(
        Object.entries(data).filter(([_, v]) => v !== undefined)
      ) as Record<string, string> }
    })),      setAiStatus: (aiStatus) => set({ aiStatus }),
      
      setPreferences: (prefs) =>
        set((state) => ({
          preferences: { ...state.preferences, ...prefs }
        })),
      
      markDayComplete: (day) =>
        set((state) => ({
          completedDays: state.completedDays.includes(day)
            ? state.completedDays
            : [...state.completedDays, day].sort()
        })),
      
      reset: () => set(initialState)
    }),
    {
      name: 'flux-id-store',
      partialize: (state) => ({
        persona: state.persona,
        profile: state.profile,
        folderItems: state.folderItems,
        formData: state.formData,
        preferences: state.preferences,
        completedDays: state.completedDays
      })
    }
  )
)

// Selector hooks for better performance
export const usePersona = () => useStore((state) => state.persona)
export const useProfile = () => useStore((state) => state.profile)
export const usePreferences = () => useStore((state) => state.preferences)
export const useCompletedDays = () => useStore((state) => state.completedDays)

// Day completion selectors
export const useIsDay1Complete = () => useStore((state) => state.completedDays.includes(1))
export const useIsDay2Complete = () => useStore((state) => state.completedDays.includes(2))
export const useIsDay3Complete = () => useStore((state) => state.completedDays.includes(3))
export const useIsDay4Complete = () => useStore((state) => state.completedDays.includes(4))
export const useIsDay5Complete = () => useStore((state) => state.completedDays.includes(5))
export const useIsDay6Complete = () => useStore((state) => state.completedDays.includes(6))
export const useIsDay7Complete = () => useStore((state) => state.completedDays.includes(7))
export const useIsDay8Complete = () => useStore((state) => state.completedDays.includes(8))
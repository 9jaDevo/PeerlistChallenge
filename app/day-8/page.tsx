import Link from "next/link"

export default function Day1Page() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-6 py-16">
        <div className="mb-8">
          <Link 
            href="/"
            className="inline-flex items-center text-gray-400 hover:text-white transition-colors px-4 py-2 rounded-lg"
          >
            ← Back to Index
          </Link>
        </div>

        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Day 1: Animated Avatar Stack
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Interactive avatar arrangements with smooth morphing between professional, 
              playful, and minimal styles. Features hover effects, keyboard navigation, 
              and burst animations.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 mb-8">
            <div className="text-center space-y-6">
              <div className="w-24 h-24 bg-purple-500/20 rounded-2xl mx-auto flex items-center justify-center">
                <span className="text-4xl">👥</span>
              </div>
              <h3 className="text-2xl font-semibold text-white">Avatar Stack Component</h3>
              <p className="text-gray-400 max-w-md mx-auto">
                Interactive avatar stack with morphing animations and burst effects.
                This component will be fully implemented with Framer Motion.
              </p>
              <div className="flex justify-center space-x-4 pt-4">
                <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors">
                  Try Demo
                </button>
                <button className="border border-gray-600 text-gray-300 hover:text-white hover:border-gray-400 px-6 py-2 rounded-lg transition-colors">
                  View Code
                </button>
              </div>
            </div>
          </div>

          <div className="text-left bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Features:</h3>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-center">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                Professional, Playful, and Minimal avatar modes
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                Hover tilt effects and smooth transitions
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                Keyboard navigation with Tab/Arrow keys
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                Burst animation with orbital motion
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                Screen reader accessible with ARIA labels
              </li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  )
}

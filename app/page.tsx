import Link from 'next/link'

const challenges = [
  { day: 1, title: 'Avatar Stack ("Burst Stack")', desc: 'Interactive avatar arrangements with burst animations', status: 'complete' },
  { day: 2, title: 'OTP Input', desc: 'Smart 6-cell OTP with paste detection & validation', status: 'complete' },
  { day: 3, title: 'Card→Page Transition ("Liquid Sheet")', desc: 'Shared element morphing with radial mask wipe', status: 'complete' },
  { day: 4, title: 'Interactive Folder ("Paper-Stack")', desc: 'Breathing folder with peek interactions & drop', status: 'complete' },
  { day: 5, title: 'Progressive Input Stack ("Chip-to-Form")', desc: 'Chips morph into form fields with stagger', status: 'complete' },
  { day: 6, title: 'Warp Overlay ("Context Portal")', desc: 'Portal-style overlay with context switching', status: 'complete' },
  { day: 7, title: 'Peerlist Autofill w/ AI ("Delightful Wait")', desc: 'AI skeleton, thought bubbles & staged reveals', status: 'complete' },
  { day: 8, title: 'Coming Soon...', desc: 'Final challenge will be revealed soon', status: 'coming-soon' }
]

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-6">
            FLUX//ID
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto mb-8">
            Eight cohesive interaction challenges. Pixel-perfect animations. 
            Built for the modern web.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link 
              href="/all"
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-2xl transition-colors font-medium"
            >
              Start the Journey
            </Link>
            <Link 
              href="/judge"
              className="border border-gray-600 text-gray-300 hover:text-white hover:border-gray-400 px-8 py-4 rounded-2xl transition-colors font-medium"
            >
              Judge Mode
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {challenges.map((challenge) => (
            <Link 
              key={challenge.day}
              href={challenge.status === 'coming-soon' ? '#' : `/day-${challenge.day}`}
              className={`group relative backdrop-blur-sm border rounded-2xl p-6 transition-all duration-300 block ${
                challenge.status === 'coming-soon' 
                  ? 'bg-gray-800/30 border-gray-700/50 cursor-not-allowed opacity-60' 
                  : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-purple-500/50 cursor-pointer'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                  challenge.status === 'coming-soon'
                    ? 'text-gray-400 bg-gray-600/20'
                    : 'text-purple-400 bg-purple-400/10'
                }`}>
                  Day {challenge.day}
                </span>
                <div className={`w-2 h-2 rounded-full transition-opacity ${
                  challenge.status === 'coming-soon'
                    ? 'bg-gray-500 opacity-40'
                    : 'bg-green-400 opacity-60 group-hover:opacity-100'
                }`} />
              </div>
              
              <h3 className={`text-lg font-semibold mb-2 transition-colors ${
                challenge.status === 'coming-soon'
                  ? 'text-gray-400'
                  : 'text-white group-hover:text-purple-400'
              }`}>
                {challenge.title}
              </h3>
              
              <p className={`text-sm transition-colors ${
                challenge.status === 'coming-soon'
                  ? 'text-gray-500'
                  : 'text-gray-400 group-hover:text-gray-300'
              }`}>
                {challenge.desc}
              </p>
              
              {challenge.status === 'coming-soon' && (
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-gray-800/20 to-gray-900/20 pointer-events-none" />
              )}
              
              {challenge.status !== 'coming-soon' && (
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              )}
            </Link>
          ))}
        </div>

        <div className="text-center mt-16 pt-8 border-t border-white/10">
          <p className="text-gray-400 text-sm">
            Built with Next.js 14, TypeScript, Tailwind CSS, and Framer Motion
          </p>
        </div>
      </div>
    </main>
  )
}

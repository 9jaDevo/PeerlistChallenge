import Link from "next/link"

export default function AllPage() {
  const challenges = [
    {
      day: 1,
      title: "Animated Avatar Stack",
      href: "/day-1",
      description: "Interactive avatar components with smooth hover animations, stack ordering, and micro-interactions",
      tags: ["Animation", "Components", "Hover Effects"]
    },
    {
      day: 2,
      title: "Interactive OTP Input",
      href: "/day-2",
      description: "One-time password input with auto-focus progression, paste handling, and visual feedback",
      tags: ["Forms", "UX", "Interaction"]
    },
    {
      day: 3,
      title: "Card to Page Transition",
      href: "/day-3",
      description: "Seamless morphing transitions between card states and full-page layouts",
      tags: ["Transitions", "Layout", "Animation"]
    },
    {
      day: 4,
      title: "Interactive Folder",
      href: "/day-4",
      description: "File system navigation with smooth animations and intuitive folder interactions",
      tags: ["Navigation", "Animation", "UX"]
    },
    {
      day: 5,
      title: "Progressive Input Stack",
      href: "/day-5",
      description: "Multi-step form progression with visual indicators and smooth transitions",
      tags: ["Forms", "Progressive", "Animation"]
    },
    {
      day: 6,
      title: "Warp Overlay Effect",
      href: "/day-6",
      description: "Advanced visual effects with warp distortions and overlay compositions",
      tags: ["Effects", "Overlay", "Advanced"]
    },
    {
      day: 7,
      title: "AI Autofill Animation",
      href: "/day-7",
      description: "Smart form completion with AI-powered suggestions and typing animations",
      tags: ["AI", "Forms", "Animation"]
    },
    {
      day: 8,
      title: "Identity Board Synthesis",
      href: "/day-8",
      description: "Complex identity dashboard with dynamic data visualization and interactions",
      tags: ["Dashboard", "Data Viz", "Complex"]
    }
  ]

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

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            All Challenges
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Complete overview of all 8 interaction design challenges. 
            Click any challenge to experience the interaction.
          </p>
        </div>

        {/* Challenges Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {challenges.map((challenge) => (
            <Link
              key={challenge.day}
              href={challenge.href}
              className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/50 rounded-2xl p-6 transition-all block group"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-purple-400 font-bold text-lg mb-1">
                    Day {challenge.day}
                  </div>
                  <h3 className="text-xl font-semibold text-white group-hover:text-purple-300 transition-colors">
                    {challenge.title}
                  </h3>
                </div>
                <div className="text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  →
                </div>
              </div>

              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                {challenge.description}
              </p>

              <div className="flex flex-wrap gap-2">
                {challenge.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-16 text-center">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 inline-block">
            <div className="grid grid-cols-3 gap-8">
              <div>
                <div className="text-3xl font-bold text-purple-400 mb-2">8</div>
                <div className="text-sm text-gray-400">Challenges</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-cyan-400 mb-2">16</div>
                <div className="text-sm text-gray-400">Components</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-400 mb-2">60fps</div>
                <div className="text-sm text-gray-400">Performance</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

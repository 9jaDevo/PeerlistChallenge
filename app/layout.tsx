import type { Metadata } from "next"
import { Inter } from 'next/font/google'
import "./globals.css"

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
})

export const metadata: Metadata = {
  title: "FLUX//ID - Interactive Design Challenges",
  description: "8 days of pixel-perfect, accessible interaction design challenges built with Next.js 14",
  keywords: ['interaction design', 'motion design', 'Next.js', 'React', 'accessibility'],
  authors: [{ name: 'FLUX//ID' }],
  openGraph: {
    title: 'FLUX//ID - Interactive Design Challenges',
    description: '8 days of pixel-perfect, accessible interaction design challenges',
    type: 'website',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-slate-900 text-white font-sans antialiased">
        {children}
      </body>
    </html>
  )
}

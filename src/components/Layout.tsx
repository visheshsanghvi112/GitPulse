import React from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'

interface LayoutProps {
  children: React.ReactNode
  title?: string
  description?: string
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  title = 'GitHub Pulse — Trending Repositories',
  description = 'Discover the most starred and trending GitHub repositories with beautiful analytics and real-time insights.'
}) => {
  const router = useRouter()

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/trending', label: 'Trending' },
    { href: '/rankings', label: 'Rankings' },
    { href: '/analytics', label: 'Analytics' },
  ]

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⚡</text></svg>" />
      </Head>

      <div className="min-h-screen w-full relative selection:bg-indigo-500/30">
        {/* Background Texture & Glows */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute inset-0 bg-[#080c14]" />
          <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150" />
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-fuchsia-600/10 blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        {/* Sticky top nav */}
        <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-black/20 border-b border-white/[0.05]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg group-hover:shadow-indigo-500/40 transition-all duration-300 group-hover:scale-110">
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                  <path d="M13 10V3L4 14H11V21L20 10H13Z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold tracking-tight text-white leading-none">
                  GITHUB PULSE
                </span>
                <span className="text-[10px] font-medium text-indigo-400/80 tracking-widest uppercase mt-0.5">
                  Analytics
                </span>
              </div>
            </Link>

            {/* Nav links */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map(({ href, label }) => {
                const active = router.pathname === href
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                      active
                        ? 'bg-white/10 text-white shadow-inner'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {label}
                  </Link>
                )
              })}
            </nav>

            <div className="flex items-center gap-3">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-white text-black hover:bg-slate-200 transition-all duration-300 shadow-xl shadow-white/5 hover:scale-105 active:scale-95"
              >
                <svg viewBox="0 0 16 16" className="h-4 w-4 fill-current">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                </svg>
                Github
              </a>
            </div>
          </div>
        </header>

        <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-[calc(100vh-160px)]">
          {children}
        </main>

        <footer className="relative z-10 border-t border-white/[0.05] py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col items-center md:items-start gap-2">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-[10px]">⚡</div>
                <span className="text-sm font-bold text-white tracking-tight">GITHUB PULSE</span>
              </div>
              <p className="text-xs text-slate-500">Real-time repository analytics & trending insights.</p>
            </div>
            <div className="text-xs text-slate-500 font-medium">
              © {new Date().getFullYear()} • Crafted for the open-source community
            </div>
            <div className="flex items-center gap-6 text-xs text-slate-500 font-medium">
              <Link href="/trending" className="hover:text-white transition-colors">Trending</Link>
              <Link href="/rankings" className="hover:text-white transition-colors">Rankings</Link>
              <Link href="/analytics" className="hover:text-white transition-colors">Analytics</Link>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}

export default Layout

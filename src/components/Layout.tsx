import React, { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { motion, useScroll, useSpring, AnimatePresence } from 'framer-motion'

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  })

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

      <motion.div 
        className="fixed top-0 left-0 right-0 h-[2px] bg-indigo-500 origin-left z-[100]" 
        style={{ scaleX }} 
      />

      <div className="min-h-screen w-full relative selection:bg-indigo-500/30">
        {/* Background Texture & Glows */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute inset-0 bg-[#080c14]" />
          
          {/* Tech Grid Pattern */}
          <div className="absolute inset-0 opacity-[0.15]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
          
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-fuchsia-600/10 blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        {/* Sticky top nav */}
        <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-[#050914]/80 border-b border-white/[0.05]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 grid grid-cols-2 md:grid-cols-3 items-center">
            {/* Logo */}
            <div className="flex justify-start">
              <Link href="/" className="flex items-center gap-2 group">
                <div className="relative h-10 w-10 flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-fuchsia-500 rounded-xl blur-[8px] opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative h-full w-full bg-black/50 backdrop-blur-md rounded-xl border border-white/20 flex items-center justify-center overflow-hidden">
                    <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 12h4l3-8 5 16 3-8h3" />
                    </svg>
                  </div>
                </div>
                <div className="flex flex-col ml-1">
                  <span className="text-sm md:text-base font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70 leading-none">
                    GITPULSE
                  </span>
                  <span className="text-[8px] md:text-[9px] font-black text-indigo-400 tracking-[0.3em] uppercase mt-0.5">
                    Analytics
                  </span>
                </div>
              </Link>
            </div>

            {/* Nav links (Middle Centric) */}
            <nav className="hidden md:flex items-center justify-center gap-1">
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

            <div className="flex items-center justify-end gap-3">
              <a
                href="https://github.com/visheshsanghvi112/GitPulse"
                target="_blank"
                rel="noreferrer"
                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-white text-black hover:bg-slate-200 transition-all duration-300 shadow-xl shadow-white/5 hover:scale-105 active:scale-95"
              >
                <svg viewBox="0 0 16 16" className="h-4 w-4 fill-current">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                </svg>
                Github
              </a>
              <button 
                className="md:hidden p-2 text-white/70 hover:text-white transition-colors rounded-xl hover:bg-white/5"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle mobile menu"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </header>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md md:hidden"
              />
              
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed top-0 right-0 bottom-0 w-[80vw] max-w-sm z-[110] bg-slate-950 border-l border-white/10 shadow-[0_0_100px_rgba(0,0,0,1)] md:hidden flex flex-col"
              >
                <div className="flex items-center justify-between h-16 px-4 border-b border-white/10">
                  <span className="font-bold text-white tracking-widest text-sm">MENU</span>
                  <button 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 text-white/70 hover:text-white transition-colors rounded-xl hover:bg-white/5"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <nav className="flex flex-col p-4 gap-2 flex-1">
                  {navLinks.map(({ href, label }) => {
                    const active = router.pathname === href
                    return (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`px-4 py-4 rounded-xl text-base font-bold transition-all ${
                          active
                            ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/20'
                            : 'text-slate-300 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {label}
                      </Link>
                    )
                  })}
                  <div className="mt-auto pb-4">
                    <a
                      href="https://github.com/visheshsanghvi112/GitPulse"
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-2 px-4 py-4 rounded-xl text-base font-bold bg-white text-black hover:bg-slate-200 transition-all shadow-xl shadow-white/5"
                    >
                      <svg viewBox="0 0 16 16" className="h-5 w-5 fill-current">
                        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                      </svg>
                      View on GitHub
                    </a>
                  </div>
                </nav>
              </motion.div>
            </>
          )}
        </AnimatePresence>

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
              <p className="text-xs text-slate-500 font-medium">
                Built by{' '}
                <a 
                  href="https://www.linkedin.com/in/vishesh-sanghvi/" 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Vishesh Sanghvi
                </a>
              </p>
            </div>
            <div className="text-xs text-slate-500 font-medium">
              © {new Date().getFullYear()} •{' '}
              <a 
                href="https://vishesh-ai.vercel.app/" 
                target="_blank" 
                rel="noreferrer"
                className="hover:text-white transition-colors"
              >
                Portfolio
              </a>
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

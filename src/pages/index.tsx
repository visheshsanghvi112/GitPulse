import React, { useEffect, useState, useMemo } from 'react'
import Layout from '@/components/Layout'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useSnapshots } from '@/hooks/useSnapshots'

const FloatingRepoCard = ({ delay, yOffset, xOffset, name, stars, lang, color }: any) => {
  return (
    <motion.div
      animate={{ 
        y: [yOffset, yOffset - 20, yOffset],
        rotateZ: [-2, 2, -2]
      }}
      transition={{ 
        duration: 6, 
        repeat: Infinity, 
        delay: delay,
        ease: "easeInOut" 
      }}
      className={`absolute ${xOffset} hidden lg:flex flex-col gap-2 p-4 bg-[#0a0f1c]/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.5)] w-48 z-0 cursor-pointer hover:scale-105 transition-transform`}
    >
      <div className="flex items-center gap-2 mb-1">
        <div className={`w-2 h-2 rounded-full ${color} animate-pulse`} />
        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Trending</span>
      </div>
      <div className="text-sm font-bold text-white truncate">{name}</div>
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-1 text-xs font-bold text-indigo-400">
          <svg viewBox="0 0 16 16" className="w-3 h-3 fill-current"><path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z"/></svg>
          {stars}
        </div>
        <span className="text-[9px] font-black uppercase text-slate-500 bg-white/5 px-2 py-0.5 rounded-full truncate max-w-[60px] text-center">{lang}</span>
      </div>
    </motion.div>
  )
}

function fmt(n: number) {
  if (!n) return '0'
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

export default function Home() {
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 1000], [0, 200])
  const y2 = useTransform(scrollY, [0, 1000], [0, -200])
  
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const { data } = useSnapshots('week')

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ 
        x: (e.clientX / window.innerWidth) * 20 - 10,
        y: (e.clientY / window.innerHeight) * 20 - 10
      })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Process Live Data
  const items = useMemo(() => data?.items || [], [data])
  const totalCount = data?.total_count || 0
  
  const top4 = items.slice(0, 4)
  const tickerData = items.slice(0, 8)

  const colors = ["bg-[#00f2fe]", "bg-[#ff0844]", "bg-[#f9d423]", "bg-[#c471f5]", "bg-[#0ba360]"]

  // Generate dynamic ticker items based on real data
  const dynamicTicker = useMemo(() => {
    if (!tickerData.length) return null;
    const phrases = tickerData.map((repo: any, i: number) => ({
      t: `${i % 2 === 0 ? '🔥' : '⚡'} ${repo.full_name} trending with ${fmt(repo.stargazers_count)}★`,
      c: colors[i % colors.length]
    }))
    
    if (totalCount > 0) {
      phrases.push({ t: `📈 ${fmt(totalCount)} active repositories scanned globally`, c: "bg-[#0ba360]" })
    }
    // Duplicate array to make scrolling seamless
    return [...phrases, ...phrases]
  }, [tickerData, totalCount])

  return (
    <Layout
      title="GitHub Pulse — The Intelligence Layer for Open Source"
      description="GitHub Pulse provides real-time insights into the world's most trending and high-impact repositories."
    >
      {/* Hero Section */}
      <section className="relative pt-24 pb-40 flex flex-col items-center text-center perspective-1000">
        
        {/* Interactive Mouse Glow */}
        <motion.div 
          animate={{ x: mousePos.x * -10, y: mousePos.y * -10 }}
          transition={{ type: "spring", stiffness: 50, damping: 20 }}
          className="absolute inset-0 pointer-events-none -z-10 flex items-center justify-center"
        >
          <div className="w-[800px] h-[800px] bg-gradient-to-tr from-indigo-500/10 via-fuchsia-500/5 to-transparent blur-[120px] rounded-full" />
        </motion.div>

        {/* Floating Mockup Cards (Real Data) */}
        {top4[0] && <FloatingRepoCard delay={0} yOffset={20} xOffset="-left-10 xl:-left-20" name={top4[0].name} stars={fmt(top4[0].stargazers_count)} lang={top4[0].language || 'Unknown'} color="bg-[#00f2fe]" />}
        {top4[1] && <FloatingRepoCard delay={1.5} yOffset={100} xOffset="-right-10 xl:-right-20" name={top4[1].name} stars={fmt(top4[1].stargazers_count)} lang={top4[1].language || 'Unknown'} color="bg-[#ff0844]" />}
        {top4[2] && <FloatingRepoCard delay={3} yOffset={240} xOffset="left-10 xl:left-0" name={top4[2].name} stars={fmt(top4[2].stargazers_count)} lang={top4[2].language || 'Unknown'} color="bg-[#f9d423]" />}
        {top4[3] && <FloatingRepoCard delay={4.5} yOffset={280} xOffset="right-10 xl:right-0" name={top4[3].name} stars={fmt(top4[3].stargazers_count)} lang={top4[3].language || 'Unknown'} color="bg-[#c471f5]" />}

        {/* Fallback dummy data if loading or failed so the page isn't empty */}
        {!top4.length && (
          <>
            <FloatingRepoCard delay={0} yOffset={20} xOffset="-left-10 xl:-left-20" name="Loading..." stars="--" lang="--" color="bg-slate-700" />
            <FloatingRepoCard delay={1.5} yOffset={100} xOffset="-right-10 xl:-right-20" name="Loading..." stars="--" lang="--" color="bg-slate-700" />
            <FloatingRepoCard delay={3} yOffset={240} xOffset="left-10 xl:left-0" name="Loading..." stars="--" lang="--" color="bg-slate-700" />
            <FloatingRepoCard delay={4.5} yOffset={280} xOffset="right-10 xl:right-0" name="Loading..." stars="--" lang="--" color="bg-slate-700" />
          </>
        )}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 w-full max-w-4xl"
        >

          <h1 className="text-5xl sm:text-7xl md:text-[6rem] font-black tracking-tighter text-white mb-8 leading-[1.05] drop-shadow-2xl">
            The Pulse of <br />
            <span className="relative inline-block mt-2">
              <span className="absolute -inset-2 bg-gradient-to-r from-[#00f2fe] via-[#c471f5] to-[#ff0844] blur-2xl opacity-40 animate-pulse" />
              <span className="relative bg-gradient-to-r from-[#00f2fe] via-[#c471f5] to-[#ff0844] bg-clip-text text-transparent">
                Open Source.
              </span>
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-slate-400 font-medium leading-relaxed mb-12 px-4 drop-shadow-md">
            Tap directly into the global development matrix. Real-time velocity tracking, deep-scan analytics, and predictive trending algorithms for world-class engineers.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="/trending">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(0, 242, 254, 0.4)" }}
                whileTap={{ scale: 0.95 }}
                className="group relative px-10 py-5 bg-white text-black font-black uppercase tracking-widest text-sm rounded-2xl overflow-hidden transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#00f2fe]/20 to-[#c471f5]/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                <span className="relative z-10 flex items-center gap-3">
                  Initialize Scan
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className="w-4 h-4 group-hover:translate-x-1 transition-transform">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </span>
              </motion.button>
            </Link>
            <Link
              href="/analytics"
              className="px-10 py-5 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest text-sm rounded-2xl border border-white/10 transition-all duration-300 backdrop-blur-xl hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]"
            >
              View Analytics
            </Link>
          </div>
        </motion.div>

        {/* Live Ticker Feed */}
        <div className="absolute bottom-0 w-full overflow-hidden whitespace-nowrap bg-white/[0.02] border-t border-b border-white/5 py-4 backdrop-blur-sm">
          <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#050914] to-transparent z-10" />
          <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#050914] to-transparent z-10" />
          <motion.div 
            animate={{ x: [0, -2000] }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            className="inline-flex gap-16 items-center text-xs font-black uppercase tracking-[0.2em] text-slate-300"
          >
            {(dynamicTicker || [
              { t: "⚡ Fetching live telemetry...", c: "bg-slate-500" },
              { t: "🔥 Synchronizing ecosystem data...", c: "bg-slate-500" },
              { t: "🌐 Connecting to matrix...", c: "bg-slate-500" },
              { t: "🚀 Calibrating sensors...", c: "bg-slate-500" },
              { t: "📈 Scanning repositories...", c: "bg-slate-500" }
            ]).map((item: any, i: number) => (
              <span key={i} className="flex items-center gap-3">
                <span className={`h-2 w-2 rounded-full ${item.c} shadow-[0_0_10px_currentColor]`} />
                {item.t}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Dynamic Grid Section */}
      <section className="mt-32 mb-32 relative z-10">
        <motion.div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-16">
          <div className="max-w-xl">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tighter">Engineered for <br /><span className="text-[#00f2fe]">Alpha Discovery.</span></h2>
            <p className="text-slate-400 font-medium text-lg">We process millions of data points to bring you the most relevant software trends before they hit the mainstream.</p>
          </div>
          <Link href="/analytics" className="text-sm font-black uppercase tracking-widest text-white hover:text-[#00f2fe] transition-colors flex items-center gap-2 group bg-white/5 px-6 py-3 rounded-full border border-white/10">
            Access Terminal <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <motion.div 
            whileHover={{ y: -8 }}
            className="md:col-span-8 p-10 rounded-[2rem] bg-gradient-to-br from-[#050914] to-[#0a0f1c] border border-white/10 relative overflow-hidden group shadow-[0_20px_40px_rgba(0,0,0,0.5)]"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#00f2fe]/10 rounded-full blur-[80px] group-hover:bg-[#00f2fe]/20 transition-colors duration-700" />
            
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00f2fe] to-[#4facfe] flex items-center justify-center text-white mb-8 shadow-[0_0_30px_rgba(0,242,254,0.3)]">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <h3 className="text-3xl font-black text-white mb-4 tracking-tight">Hyper-Velocity Tracking</h3>
              <p className="text-slate-400 text-lg leading-relaxed font-medium max-w-lg">Identify massive spikes in repository adoption the moment they happen. Our algorithms track star velocity, fork momentum, and language shifts in real-time.</p>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -8 }}
            className="md:col-span-4 p-10 rounded-[2rem] bg-gradient-to-br from-[#050914] to-[#0a0f1c] border border-white/10 relative overflow-hidden group shadow-[0_20px_40px_rgba(0,0,0,0.5)]"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#ff0844]/10 rounded-full blur-[60px] group-hover:bg-[#ff0844]/20 transition-colors duration-700" />
            
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#ff0844] to-[#ffb199] flex items-center justify-center text-white mb-8 shadow-[0_0_30px_rgba(255,8,68,0.3)]">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3v1.25m0 0h.75m-.75 0V3m.75 1.25h.75m-.75 0V3m.75 1.25h.75" /></svg>
              </div>
              <h3 className="text-2xl font-black text-white mb-4 tracking-tight">Deep Matrix</h3>
              <p className="text-slate-400 font-medium">Access years of historical data to uncover hidden, long-term foundational shifts.</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Interactive CTA */}
      <motion.section 
        className="relative p-12 md:p-24 rounded-[3rem] bg-black overflow-hidden border border-white/10"
      >
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#c471f5]/20 to-[#00f2fe]/20" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#00f2fe]/20 blur-[120px] rounded-full mix-blend-screen animate-pulse" />
        </div>
        
        <div className="relative z-10 flex flex-col items-center text-center">
          <h2 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter drop-shadow-2xl">Enter the <br /> Ecosystem.</h2>
          <p className="text-white/70 text-xl font-medium mb-12 max-w-xl">Initialize your terminal and tap directly into the source code of the internet.</p>
          
          <Link href="/trending">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-12 py-6 bg-white text-black font-black uppercase tracking-widest text-sm rounded-full shadow-[0_0_50px_rgba(255,255,255,0.3)] hover:shadow-[0_0_80px_rgba(255,255,255,0.5)] transition-shadow"
            >
              Commence Uplink
            </motion.button>
          </Link>
        </div>
      </motion.section>
    </Layout>
  )
}

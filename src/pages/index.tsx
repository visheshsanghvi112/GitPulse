import React from 'react'
import Layout from '@/components/Layout'
import Link from 'next/link'
import { motion } from 'framer-motion'

const FEATURES = [
  { icon: '🔥', title: 'Daily Trending', desc: 'Repos ranked by stars gained today, this week, and this month.' },
  { icon: '📊', title: 'Rich Analytics', desc: 'Language breakdowns, star history, and fork trends at a glance.' },
  { icon: '⚡', title: 'Snapshot-Fast', desc: 'JSON snapshots committed daily — no live API bottlenecks.' },
  { icon: '🌐', title: 'Multi-language', desc: 'Filter by JavaScript, TypeScript, Python, Go, Rust and more.' },
]

const STATS = [
  { value: '100+', label: 'Repos tracked daily' },
  { value: '6+', label: 'Languages covered' },
  { value: '<1s', label: 'Load time' },
]

export default function Home() {
  return (
    <Layout
      title="GitHub Pulse — The Intelligence Layer for Open Source"
      description="GitHub Pulse provides real-time insights into the world's most trending and high-impact repositories. Explore analytics, rankings, and deep-dives into open-source excellence."
    >
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl text-[11px] font-bold tracking-[0.2em] uppercase text-indigo-400 mb-8">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            Real-time Repository Intelligence
          </div>

          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white mb-6 leading-[0.9]">
            The Pulse of <br />
            <span className="bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
              Open Source.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-400 font-medium leading-relaxed mb-12">
            Stay ahead of the curve. Discover the next big thing in software through deep analytics, real-time trending data, and historical rankings.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/trending"
              className="group relative px-8 py-4 bg-white text-black font-bold rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-2xl shadow-white/10"
            >
              <span className="relative z-10 flex items-center gap-2">
                Explore Trending
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 group-hover:translate-x-1 transition-transform">
                  <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                </svg>
              </span>
            </Link>
            <Link
              href="/rankings"
              className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl border border-white/10 transition-all duration-300 backdrop-blur-xl"
            >
              View Rankings
            </Link>
          </div>
        </motion.div>

        {/* Abstract Background Elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none overflow-hidden -z-10">
          <div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] bg-indigo-600/10 blur-[150px] rounded-full" />
          <div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] bg-violet-600/10 blur-[150px] rounded-full" />
        </div>
      </section>

      {/* Stats Section */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-32">
        {[
          { label: 'Active Repos', value: '1.2M+' },
          { label: 'Updates / Hr', value: '850+' },
          { label: 'Languages', value: '45+' },
          { label: 'Analytics Pins', value: '12K+' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="p-8 rounded-3xl bg-white/[0.02] border border-white/[0.05] flex flex-col items-center justify-center text-center backdrop-blur-sm"
          >
            <span className="text-3xl font-black text-white mb-1 tracking-tight">{stat.value}</span>
            <span className="text-[10px] font-bold tracking-widest uppercase text-slate-500">{stat.label}</span>
          </motion.div>
        ))}
      </section>

      {/* Features Grid */}
      <section className="mb-32">
        <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-12">
          <div className="max-w-xl">
            <h2 className="text-4xl font-bold text-white mb-4 tracking-tight">Built for Builders.</h2>
            <p className="text-slate-400 font-medium">We process millions of data points to bring you the most relevant software trends before they hit the mainstream.</p>
          </div>
          <Link href="/analytics" className="text-sm font-bold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-2 group">
            Detailed Analytics <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: 'Trend Forecasting',
              desc: 'Identify emerging patterns in library adoption and developer interests globally.',
              icon: 'M13 10V3L4 14H11V21L20 10H13Z',
              color: 'from-blue-500 to-cyan-500'
            },
            {
              title: 'Language Insights',
              desc: 'Detailed shifts in programming language popularity across different sectors.',
              icon: 'M9.75 3.104v1.242c0 .483.391.874.875.874h.75c.484 0 .875-.391.875-.874V3.104c.484.06.904.325 1.154.715l.391.61c.25.39.25.88 0 1.27l-.391.61a1.375 1.375 0 01-1.154.715h-.75c-.484 0-.875.391-.875.875v.75c0 .484.391.875.875.875h.75c.484 0 .875-.391.875-.875v-.75c0-.484.391-.875.875-.875h.75c.484 0 .875.391.875.875v.75c0 .484.391.875.875.875h.75c.484 0 .875-.391.875-.875v-.75c0-.484.391-.875.875-.875h.75c.484 0 .875.391.875.875v.75c0 .484.391.875.875.875h.75c.484 0 .875-.391.875-.875v-.75c0-.484.391-.875.875-.875h.75c.484 0 .875.391.875.875v.75c0 .484.391.875.875.875h.75c.484 0 .875-.391.875-.875v-.75',
              color: 'from-indigo-500 to-violet-500'
            },
            {
              title: 'Historical Archive',
              desc: 'Access years of repository data to understand long-term growth and stability.',
              icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6',
              color: 'from-fuchsia-500 to-pink-500'
            }
          ].map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group p-10 rounded-3xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-all duration-500"
            >
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center text-white mb-8 shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform duration-500`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d={f.icon} />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{f.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed font-medium">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative p-12 md:p-24 rounded-[40px] bg-gradient-to-br from-indigo-600 to-violet-700 overflow-hidden shadow-2xl shadow-indigo-500/20">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 contrast-150 brightness-100" />
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">Master the <br /> GitHub Ecosystem.</h2>
          <p className="text-indigo-100 text-lg font-medium mb-10 opacity-90">Join thousands of developers using GitHub Pulse to discover high-quality projects and stay informed.</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/trending" className="px-10 py-4 bg-white text-indigo-600 font-black rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/10">
              Get Started Now
            </Link>
          </div>
        </div>
        <div className="absolute right-[-10%] bottom-[-10%] w-[500px] h-[500px] bg-white/10 blur-[100px] rounded-full" />
      </section>
    </Layout>
  )
}

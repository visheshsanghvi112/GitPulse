import React, { useState } from 'react'
import Layout from '@/components/Layout'
import RepoCardAdvanced from '@/components/cards/RepoCardAdvanced'
import { useSnapshots } from '@/hooks/useSnapshots'
import { motion, AnimatePresence } from 'framer-motion'

const DURATIONS = [
  { value: 'today', label: 'Today' },
  { value: 'week',  label: 'This Week' },
  { value: 'month', label: 'This Month' },
] as const

const LANGUAGES = ['', 'JavaScript', 'TypeScript', 'Python', 'Go', 'Rust', 'Java', 'C++', 'Swift']

export default function Trending() {
  const [duration, setDuration] = useState<'today' | 'week' | 'month'>('week')
  const [language, setLanguage] = useState<string>('')
  const { data, loading, error } = useSnapshots(duration)

  const allItems: any[] = data?.items ?? []
  const items = language ? allItems.filter((r: any) => r.language === language) : allItems

  return (
    <Layout
      title="Trending Repositories — GitHub Pulse"
      description="Browse the most trending GitHub repositories by day, week, or month. Filter by language."
    >
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Trending Repositories</h1>
        <p className="text-slate-500 font-medium text-sm flex items-center gap-2">
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
              Analyzing the ecosystem...
            </span>
          ) : (
            <>
              <span className="h-2 w-2 rounded-full bg-green-500" />
              Found {items.length} high-impact repositories
              {data?.date && <span className="text-slate-600">• Snapshot: {data.date}</span>}
            </>
          )}
        </p>
      </div>

      {/* Filters Section */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12 p-6 rounded-[2rem] bg-white/[0.02] border border-white/[0.05] backdrop-blur-xl">
        <div className="flex items-center gap-1.5 p-1.5 bg-black/40 rounded-2xl border border-white/5">
          {DURATIONS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setDuration(value)}
              className={`px-6 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${
                duration === value
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full appearance-none bg-white/[0.05] hover:bg-white/[0.08] text-white px-5 py-2.5 rounded-2xl text-xs font-bold border border-white/10 outline-none cursor-pointer transition-all pr-10"
            >
              <option value="" className="bg-slate-900">All Languages</option>
              {LANGUAGES.filter(Boolean).map((l) => (
                <option key={l} value={l} className="bg-slate-900">{l}</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          {language && (
            <button
              onClick={() => setLanguage('')}
              className="px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="glass rounded-2xl p-8 text-center text-red-400">
          <div className="text-2xl mb-2">⚠️</div>
          <p className="font-medium">Failed to load trending data</p>
          <p className="text-sm text-slate-500 mt-1">{String(error?.message ?? 'Unknown error')}</p>
        </div>
      )}

      {/* Grid */}
      {!error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="wait">
            {loading
              ? Array.from({ length: 9 }).map((_, i) => (
                  <motion.div
                    key={`skel-${i}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <RepoCardAdvanced skeleton />
                  </motion.div>
                ))
              : items.map((repo: any, i: number) => (
                  <motion.div
                    key={repo.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: i * 0.04 }}
                  >
                    <RepoCardAdvanced repo={repo} />
                  </motion.div>
                ))
            }
          </AnimatePresence>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && items.length === 0 && (
        <div className="glass rounded-2xl p-12 text-center">
          <div className="text-4xl mb-4">🌙</div>
          <p className="font-semibold text-white mb-2">No repositories found</p>
          <p className="text-sm text-slate-400">Try a different time range or language filter.</p>
        </div>
      )}
    </Layout>
  )
}

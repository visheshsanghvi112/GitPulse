import React, { useState } from 'react'
import Layout from '@/components/Layout'
import { motion, AnimatePresence } from 'framer-motion'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const LANG_ICONS: Record<string, string> = {
  Python: '🐍',
  JavaScript: '🟨',
  TypeScript: '🔷',
  Go: '🐹',
  Rust: '🦀',
  Java: '☕',
  'C++': '⚡',
  'C': '🔵',
  Ruby: '💎',
  Swift: '🍎',
  Kotlin: '🟣',
  PHP: '🐘',
  Dart: '🎯',
  Scala: '🔴',
  Haskell: '🔮',
  Lua: '🌙',
  Shell: '🐚',
  HTML: '🌐',
  CSS: '🎨',
  R: '📊',
  stars: '⭐',
  forks: '🍴',
}

const KNOWN_CATS = [
  'stars', 'forks',
  'Python', 'JavaScript', 'TypeScript', 'Go', 'Rust', 'Java',
  'C', 'CPP', 'Swift', 'Kotlin', 'Ruby', 'PHP', 'Dart', 'Shell',
  'HTML', 'CSS', 'Scala', 'Haskell', 'Lua', 'R', 'MATLAB',
  'CSharp', 'PowerShell', 'Elixir', 'Clojure', 'Julia'
]

const DISPLAY_NAMES: Record<string, string> = {
  stars: 'Top Stars', forks: 'Top Forks', CPP: 'C++', CSharp: 'C#',
}

function fmt(n: number) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

function StarBadge({ count }: { count: number }) {
  return (
    <span className="flex items-center gap-1 text-yellow-400 text-xs font-semibold">
      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
      {fmt(count)}
    </span>
  )
}

export default function Rankings() {
  const [category, setCategory] = useState('stars')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  const url = `/api/rankings?category=${category}${debouncedSearch ? `&q=${encodeURIComponent(debouncedSearch)}` : ''}`
  const { data, isLoading } = useSWR(url, fetcher, { revalidateOnFocus: false })

  const items: any[] = data?.items ?? []

  const handleSearch = (val: string) => {
    setSearch(val)
    clearTimeout((handleSearch as any)._t)
    ;(handleSearch as any)._t = setTimeout(() => setDebouncedSearch(val), 350)
  }

  return (
    <Layout
      title="Rankings — GitHub Pulse"
      description="Browse the most starred GitHub repositories by language: Python, TypeScript, Go, Rust, and more. Top 100 per category."
    >
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Ecosystem Rankings</h1>
        <p className="text-slate-500 font-medium text-sm flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-indigo-500" />
          The definitive ranking of open-source excellence across {KNOWN_CATS.length} categories.
        </p>
      </div>

      {/* Category pills */}
      <div className="mb-8 overflow-x-auto pb-4 no-scrollbar">
        <div className="flex items-center gap-2 w-max">
          {KNOWN_CATS.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all duration-300 ${
                category === cat
                  ? 'bg-white text-black shadow-xl shadow-white/5'
                  : 'bg-white/5 text-slate-500 hover:text-white hover:bg-white/10 border border-white/5'
              }`}
            >
              <span className="text-lg leading-none">{LANG_ICONS[cat] ?? '📦'}</span>
              {DISPLAY_NAMES[cat] ?? cat}
            </button>
          ))}
        </div>
      </div>

      {/* Search & Meta */}
      <div className="mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="relative w-full md:w-96">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            placeholder={`Filter ${DISPLAY_NAMES[category] ?? category} repos...`}
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full bg-white/[0.03] border border-white/10 pl-12 pr-6 py-3.5 rounded-[1.5rem] text-sm text-white placeholder-slate-600 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/30 transition-all font-medium"
          />
        </div>
        
        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">
          <div className="h-1 w-1 rounded-full bg-slate-700" />
          Showing {items.length} Curated results
          <div className="h-1 w-1 rounded-full bg-slate-700" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/[0.01] border border-white/[0.05] rounded-[2.5rem] overflow-hidden backdrop-blur-sm shadow-2xl">
        {/* Table header */}
        <div className="grid grid-cols-[60px_1fr_100px_100px_120px] gap-4 px-8 py-5 border-b border-white/[0.05] text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">
          <div>Rank</div>
          <div>Project Architecture</div>
          <div className="text-right">Stars</div>
          <div className="text-right">Forks</div>
          <div className="text-right hidden sm:block">Ecosystem</div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-white/[0.04]">
          <AnimatePresence mode="wait">
            {isLoading
              ? Array.from({ length: 15 }).map((_, i) => (
                  <div key={i} className="grid grid-cols-[60px_1fr_100px_100px_120px] gap-4 px-8 py-5 items-center">
                    <div className="h-4 w-8 skeleton-shimmer rounded" />
                    <div className="space-y-1.5">
                      <div className="h-3.5 w-48 skeleton-shimmer rounded" />
                      <div className="h-3 w-72 skeleton-shimmer rounded" />
                    </div>
                    <div className="h-4 w-12 skeleton-shimmer rounded ml-auto" />
                    <div className="h-4 w-10 skeleton-shimmer rounded" />
                    <div className="h-5 w-16 skeleton-shimmer rounded hidden sm:block" />
                  </div>
                ))
              : items.map((repo: any, i: number) => (
                  <motion.a
                    key={repo.html_url}
                    href={repo.html_url}
                    target="_blank"
                    rel="noreferrer"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25, delay: Math.min(i * 0.02, 0.4) }}
                    className="grid grid-cols-[60px_1fr_100px_100px_120px] gap-4 px-8 py-6 items-center hover:bg-white/[0.03] transition-colors group"
                  >
                    {/* Rank */}
                    <div className={`text-lg font-black tracking-tighter tabular-nums ${
                      repo.rank <= 3 ? 'text-indigo-400' : 'text-slate-700'
                    }`}>
                      {String(repo.rank).padStart(2, '0')}
                    </div>

                    {/* Name + description */}
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors truncate tracking-tight">
                        {repo.full_name}
                      </div>
                      {repo.description && (
                        <div className="text-[11px] text-slate-500 truncate mt-1 max-w-md font-medium">
                          {repo.description}
                        </div>
                      )}
                    </div>

                    {/* Stars */}
                    <div className="text-right">
                      <div className="text-xs font-bold text-white tabular-nums">{fmt(repo.stars)}</div>
                      <div className="text-[9px] font-black uppercase tracking-widest text-slate-600">Stars</div>
                    </div>

                    {/* Forks */}
                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-400 tabular-nums">{fmt(repo.forks)}</div>
                      <div className="text-[9px] font-black uppercase tracking-widest text-slate-700">Forks</div>
                    </div>

                    {/* Language */}
                    <div className="hidden sm:flex justify-end">
                      {repo.language ? (
                        <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-white/5 text-slate-400 border border-white/5">
                          {repo.language}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-800">—</span>
                      )}
                    </div>
                  </motion.a>
                ))
            }
          </AnimatePresence>
        </div>

        {/* Empty state */}
        {!isLoading && items.length === 0 && (
          <div className="py-16 text-center">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-slate-400 font-medium">No results found</p>
            <p className="text-slate-500 text-sm mt-1">Try a different search term</p>
          </div>
        )}
      </div>

      {/* Footer note */}
      <div className="mt-4 text-center text-xs text-slate-600">
        Data sourced from{' '}
        <a href="https://github.com/EvanLi/Github-Ranking" target="_blank" rel="noreferrer" className="text-slate-500 hover:text-slate-300 underline transition-colors">
          Github-Ranking
        </a>{' '}
        • Updated regularly
      </div>
    </Layout>
  )
}

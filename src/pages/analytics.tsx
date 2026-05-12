import React, { useState, useMemo } from 'react'
import Layout from '@/components/Layout'
import { useSnapshots } from '@/hooks/useSnapshots'
import { motion } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend, ScatterChart, Scatter, ZAxis, CartesianGrid
} from 'recharts'

const COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981',
  '#06b6d4', '#f97316', '#ef4444', '#84cc16', '#a78bfa'
]

const DURATIONS = [
  { value: 'today', label: 'Today' },
  { value: 'week',  label: 'This Week' },
  { value: 'month', label: 'This Month' },
] as const

function fmt(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#080c14]/90 backdrop-blur-xl px-4 py-3 rounded-2xl text-xs text-slate-200 shadow-2xl border border-white/10 ring-1 ring-white/5">
      <div className="font-black text-sm mb-1">{payload[0].payload.name}</div>
      <div className="text-slate-400 font-medium">Stars: <span className="text-yellow-400 font-bold">{fmt(payload[0].value)}</span></div>
    </div>
  )
}

export default function Analytics() {
  const [duration, setDuration] = useState<'today' | 'week' | 'month'>('week')
  const { data, loading } = useSnapshots(duration)

  const items: any[] = useMemo(() => data?.items ?? [], [data?.items])

  // Language distribution
  const langData = useMemo(() => {
    const counts: Record<string, number> = {}
    items.forEach((r) => {
      const l = r.language || 'Unknown'
      counts[l] = (counts[l] || 0) + 1
    })
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, value]) => ({ name, value }))
  }, [items])

  // Top 10 repos by stars for bar chart
  const topRepos = useMemo(() =>
    [...items]
      .sort((a, b) => (b.stargazers_count ?? 0) - (a.stargazers_count ?? 0))
      .slice(0, 10)
      .map((r) => ({ name: r.name, stars: r.stargazers_count ?? 0, lang: r.language })),
    [items]
  )

  // Scatter data (Stars vs Forks)
  const scatterData = useMemo(() => {
    return items.map(r => ({
      x: r.stargazers_count ?? 0,
      y: r.forks_count ?? 0,
      name: r.name,
      lang: r.language || 'Unknown'
    }))
  }, [items])

  const totalStars = items.reduce((s, r) => s + (r.stargazers_count ?? 0), 0)
  const avgStars = items.length ? Math.round(totalStars / items.length) : 0
  const topLang = langData[0]?.name ?? '—'

  return (
    <Layout
      title="Analytics — GitHub Pulse"
      description="Visualize trending GitHub repository statistics: language distributions, star counts, and fork analytics."
    >
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white mb-1">📊 Analytics</h1>
        <p className="text-slate-400 text-sm">Visualize trending repo stats at a glance.</p>
      </div>

      {/* Duration filter */}
      <div className="flex items-center gap-1 glass rounded-xl p-1 w-full sm:w-fit overflow-x-auto no-scrollbar mb-8">
        {DURATIONS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setDuration(value)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              duration === value
                ? 'bg-indigo-600 text-white shadow shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12"
      >
        {[
          { label: 'Repos Analyzed', value: loading ? '...' : String(items.length), icon: '📦', color: 'bg-indigo-500/10 text-indigo-400', border: 'hover:border-indigo-500/30' },
          { label: 'Total Stars Tracked', value: loading ? '...' : fmt(totalStars), icon: '⭐', color: 'bg-yellow-500/10 text-yellow-400', border: 'hover:border-yellow-500/30' },
          { label: 'Avg Stars / Repo', value: loading ? '...' : fmt(avgStars), icon: '📈', color: 'bg-emerald-500/10 text-emerald-400', border: 'hover:border-emerald-500/30' },
          { label: 'Dominant Ecosystem', value: loading ? '...' : topLang, icon: '💻', color: 'bg-fuchsia-500/10 text-fuchsia-400', border: 'hover:border-fuchsia-500/30' },
        ].map((s) => (
          <motion.div 
            key={s.label} 
            whileHover={{ y: -5 }}
            className={`p-6 sm:p-8 rounded-[2rem] bg-white/[0.02] border border-white/[0.05] ${s.border} flex flex-col items-center text-center backdrop-blur-sm transition-colors duration-300 shadow-xl`}
          >
            <div className={`w-12 h-12 rounded-2xl ${s.color} flex items-center justify-center text-xl mb-5 shadow-inner`}>
              {s.icon}
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white truncate w-full tracking-tighter">{s.value}</div>
            <div className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 mt-2">{s.label}</div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Top repos bar chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/[0.02] border border-white/[0.05] backdrop-blur-xl rounded-[2rem] p-6 sm:p-8"
        >
          <h2 className="font-bold text-white mb-6 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-indigo-500" />
            Top 10 by Stars
          </h2>
          {loading ? (
            <div className="h-64 flex items-center justify-center text-slate-500 text-sm font-medium">Loading intelligence…</div>
          ) : topRepos.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-slate-500 text-sm font-medium">No data points</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={topRepos} layout="vertical" margin={{ left: 0, right: 20, top: 0, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={100} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="stars" radius={[0, 6, 6, 0]}>
                  {topRepos.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Language pie chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/[0.02] border border-white/[0.05] backdrop-blur-xl rounded-[2rem] p-6 sm:p-8"
        >
          <h2 className="font-bold text-white mb-6 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-fuchsia-500" />
            Language Distribution
          </h2>
          {loading ? (
            <div className="h-64 flex items-center justify-center text-slate-500 text-sm font-medium">Loading intelligence…</div>
          ) : langData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-slate-500 text-sm font-medium">No data points</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={langData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={60}
                  paddingAngle={5}
                  stroke="none"
                >
                  {langData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }: any) =>
                    active && payload?.length ? (
                      <div className="bg-[#080c14]/90 backdrop-blur-xl px-4 py-3 rounded-2xl text-xs text-slate-200 border border-white/10 ring-1 ring-white/5">
                        <span className="font-black text-sm">{payload[0].name}</span>
                        <div className="mt-1 text-slate-400 font-medium"><span className="text-white">{payload[0].value}</span> repos analyzed</div>
                      </div>
                    ) : null
                  }
                />
                <Legend
                  formatter={(val) => <span className="text-xs font-medium text-slate-400 hover:text-white transition-colors">{val}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>

      {/* Scatter Chart (Stars vs Forks) */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white/[0.02] border border-white/[0.05] backdrop-blur-xl rounded-[2rem] p-6 sm:p-8 mb-6"
      >
        <h2 className="font-bold text-white mb-6 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Ecosystem Correlation: Stars vs. Forks
        </h2>
        {loading ? (
          <div className="h-72 flex items-center justify-center text-slate-500 text-sm font-medium">Loading intelligence…</div>
        ) : scatterData.length === 0 ? (
          <div className="h-72 flex items-center justify-center text-slate-500 text-sm font-medium">No data points</div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart margin={{ top: 10, right: 30, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis 
                type="number" 
                dataKey="x" 
                name="Stars" 
                tick={{ fill: '#64748b', fontSize: 11 }} 
                axisLine={false} 
                tickLine={false}
                tickFormatter={(val) => fmt(val)}
              />
              <YAxis 
                type="number" 
                dataKey="y" 
                name="Forks" 
                tick={{ fill: '#64748b', fontSize: 11 }} 
                axisLine={false} 
                tickLine={false}
                tickFormatter={(val) => fmt(val)}
              />
              <ZAxis type="category" dataKey="name" name="Repo" />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3', stroke: 'rgba(255,255,255,0.1)' }}
                content={({ active, payload }: any) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-[#080c14]/90 backdrop-blur-xl px-4 py-3 rounded-2xl text-xs text-slate-200 border border-white/10 ring-1 ring-white/5">
                        <div className="font-black text-sm mb-2 text-white">{data.name}</div>
                        <div className="flex items-center gap-4 text-slate-400 font-medium">
                          <div>Stars: <span className="text-yellow-400 font-bold">{fmt(data.x)}</span></div>
                          <div>Forks: <span className="text-emerald-400 font-bold">{fmt(data.y)}</span></div>
                        </div>
                      </div>
                    )
                  }
                  return null;
                }}
              />
              <Scatter name="Repos" data={scatterData}>
                {scatterData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} opacity={0.7} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        )}
      </motion.div>

      {/* Snapshot info */}
      {data?.date && (
        <div className="mt-8 text-center text-xs text-slate-600">
          Snapshot date: <span className="text-slate-400">{data.date}</span>
        </div>
      )}
    </Layout>
  )
}

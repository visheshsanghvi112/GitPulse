import React, { useState, useMemo } from 'react'
import Layout from '@/components/Layout'
import { useSnapshots } from '@/hooks/useSnapshots'
import { motion } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend, ScatterChart, Scatter, ZAxis, CartesianGrid
} from 'recharts'

// High-end cyber palette
const COLORS = [
  '#818cf8', // Indigo
  '#c084fc', // Purple
  '#2dd4bf', // Teal
  '#fbbf24', // Amber
  '#f472b6', // Pink
  '#38bdf8', // Sky
  '#a78bfa', // Violet
  '#34d399', // Emerald
  '#f87171', // Red
  '#94a3b8'  // Slate
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
    <div className="bg-[#0a0f1c] backdrop-blur-2xl px-5 py-4 rounded-2xl text-xs text-white shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-white/10 ring-1 ring-white/5">
      <div className="font-black text-sm mb-2">{payload[0].payload.name}</div>
      <div className="text-slate-400 font-medium flex items-center gap-2">
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: payload[0].fill || '#818cf8' }} />
        <span>Count:</span>
        <span className="text-white font-bold tracking-wider">{fmt(payload[0].value)}</span>
      </div>
    </div>
  )
}

export default function Analytics() {
  const [duration, setDuration] = useState<'today' | 'week' | 'month'>('week')
  const { data, loading } = useSnapshots(duration)

  const items: any[] = useMemo(() => data?.items ?? [], [data?.items])

  const langData = useMemo(() => {
    const counts: Record<string, number> = {}
    items.forEach((r) => {
      const l = r.language || 'Unknown'
      counts[l] = (counts[l] || 0) + 1
    })
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, value]) => ({ name, value }))
  }, [items])

  const topRepos = useMemo(() =>
    [...items]
      .sort((a, b) => (b.stargazers_count ?? 0) - (a.stargazers_count ?? 0))
      .slice(0, 10)
      .map((r) => ({ name: r.name, stars: r.stargazers_count ?? 0, lang: r.language })),
    [items]
  )

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
      <div className="mb-10">
        <h1 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tighter">Network <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Intelligence</span></h1>
        <p className="text-slate-400 text-sm font-medium">Real-time repository telemetry and language correlations.</p>
      </div>

      {/* Duration filter */}
      <div className="flex items-center gap-1 bg-[#0a0f1c]/80 backdrop-blur-md rounded-xl p-1.5 w-full sm:w-fit overflow-x-auto no-scrollbar mb-10 border border-white/5">
        {DURATIONS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setDuration(value)}
            className={`px-5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              duration === value
                ? 'bg-white/10 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.02]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Bento Grid Summary Cards */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10"
      >
        {[
          { label: 'Repositories Analyzed', value: loading ? '...' : String(items.length), color: 'from-indigo-400 to-indigo-600' },
          { label: 'Aggregate Stars', value: loading ? '...' : fmt(totalStars), color: 'from-amber-400 to-orange-500' },
          { label: 'Average Repo Stars', value: loading ? '...' : fmt(avgStars), color: 'from-emerald-400 to-teal-500' },
          { label: 'Dominant Ecosystem', value: loading ? '...' : topLang, color: 'from-fuchsia-400 to-purple-600' },
        ].map((s) => (
          <motion.div 
            key={s.label} 
            whileHover={{ scale: 1.02 }}
            className="p-6 rounded-[2rem] bg-gradient-to-b from-white/[0.04] to-transparent border border-white/[0.05] flex flex-col justify-between backdrop-blur-xl relative overflow-hidden group shadow-2xl"
          >
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${s.color} opacity-0 group-hover:opacity-10 blur-3xl transition-opacity duration-700`} />
            <div className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 mb-6">{s.label}</div>
            <div className={`text-4xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-br ${s.color}`}>
              {s.value}
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        {/* Top repos bar chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#0a0f1c]/50 border border-white/[0.05] backdrop-blur-2xl rounded-[2rem] p-6 sm:p-8 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-50" />
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-8">Top Repositories by Star Velocity</h2>
          
          {loading ? (
            <div className="h-64 flex items-center justify-center text-slate-500 text-sm font-medium">Calibrating telemetry…</div>
          ) : topRepos.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-slate-500 text-sm font-medium">No signals detected</div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={topRepos} layout="vertical" margin={{ left: 0, right: 20, top: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#4f46e5" />
                    <stop offset="100%" stopColor="#c084fc" />
                  </linearGradient>
                </defs>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={110} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                <Bar dataKey="stars" radius={[0, 4, 4, 0]} fill="url(#barGradient)" barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Language doughnut chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#0a0f1c]/50 border border-white/[0.05] backdrop-blur-2xl rounded-[2rem] p-6 sm:p-8 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-fuchsia-500 to-pink-500 opacity-50" />
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-8">Ecosystem Distribution Matrix</h2>
          
          {loading ? (
            <div className="h-64 flex items-center justify-center text-slate-500 text-sm font-medium">Calibrating telemetry…</div>
          ) : langData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-slate-500 text-sm font-medium">No signals detected</div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={langData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={75}
                  paddingAngle={4}
                  stroke="rgba(10,15,28,1)"
                  strokeWidth={4}
                  cornerRadius={6}
                >
                  {langData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  formatter={(val) => <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{val}</span>}
                  iconType="circle"
                  iconSize={6}
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
        className="bg-[#0a0f1c]/50 border border-white/[0.05] backdrop-blur-2xl rounded-[2rem] p-6 sm:p-8 mb-6 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 to-emerald-500 opacity-50" />
        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-8">Engagement Scatter Vector (Stars vs Forks)</h2>
        
        {loading ? (
          <div className="h-72 flex items-center justify-center text-slate-500 text-sm font-medium">Calibrating telemetry…</div>
        ) : scatterData.length === 0 ? (
          <div className="h-72 flex items-center justify-center text-slate-500 text-sm font-medium">No signals detected</div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <ScatterChart margin={{ top: 10, right: 30, bottom: 20, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
              <XAxis 
                type="number" 
                dataKey="x" 
                name="Stars" 
                tick={{ fill: '#475569', fontSize: 10, fontWeight: 700 }} 
                axisLine={{ stroke: 'rgba(255,255,255,0.05)' }} 
                tickLine={false}
                tickFormatter={(val) => fmt(val)}
                domain={['auto', 'auto']}
              />
              <YAxis 
                type="number" 
                dataKey="y" 
                name="Forks" 
                tick={{ fill: '#475569', fontSize: 10, fontWeight: 700 }} 
                axisLine={{ stroke: 'rgba(255,255,255,0.05)' }} 
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
                      <div className="bg-[#0a0f1c] backdrop-blur-2xl px-5 py-4 rounded-2xl text-xs text-slate-200 shadow-[0_0_40px_rgba(45,212,191,0.15)] border border-teal-500/20 ring-1 ring-white/5">
                        <div className="font-black text-sm mb-3 text-white tracking-wide">{data.name}</div>
                        <div className="flex items-center justify-between gap-6">
                          <div className="flex flex-col">
                            <span className="text-[9px] uppercase tracking-[0.2em] text-slate-500 font-bold mb-1">Stars</span>
                            <span className="text-yellow-400 font-black text-sm">{fmt(data.x)}</span>
                          </div>
                          <div className="h-6 w-px bg-white/10" />
                          <div className="flex flex-col">
                            <span className="text-[9px] uppercase tracking-[0.2em] text-slate-500 font-bold mb-1">Forks</span>
                            <span className="text-teal-400 font-black text-sm">{fmt(data.y)}</span>
                          </div>
                        </div>
                      </div>
                    )
                  }
                  return null;
                }}
              />
              <Scatter name="Repos" data={scatterData}>
                {scatterData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill="#2dd4bf" opacity={0.6} stroke="#ccfbf1" strokeWidth={1} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        )}
      </motion.div>

      {/* Snapshot info */}
      {data?.date && (
        <div className="mt-8 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">
          Telemetry Captured: <span className="text-slate-400">{data.date}</span>
        </div>
      )}
    </Layout>
  )
}


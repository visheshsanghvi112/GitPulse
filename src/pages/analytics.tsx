import React, { useState, useMemo } from 'react'
import Layout from '@/components/Layout'
import { useSnapshots } from '@/hooks/useSnapshots'
import { motion } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend, ScatterChart, Scatter, ZAxis, CartesianGrid
} from 'recharts'

// Ultra-Vibrant Cyberpunk/Synthwave Gradients
const GRADIENTS = [
  'url(#gradCyber)',
  'url(#gradNeon)',
  'url(#gradSunset)',
  'url(#gradAurora)',
  'url(#gradPlasma)',
  'url(#gradToxic)',
  'url(#gradGold)',
  'url(#gradMagic)'
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
  const isGradient = payload[0].fill?.startsWith('url')
  
  return (
    <div className="bg-[#050914]/90 backdrop-blur-2xl px-5 py-4 rounded-2xl text-xs text-white shadow-[0_0_50px_rgba(0,242,254,0.15)] border border-white/10 ring-1 ring-white/5 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00f2fe] to-[#ff0844]" />
      <div className="font-black text-sm mb-2 drop-shadow-md">{payload[0].payload.name}</div>
      <div className="text-slate-300 font-medium flex items-center gap-2">
        <div 
          className="w-2.5 h-2.5 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]" 
          style={{ background: isGradient ? 'linear-gradient(135deg, #00f2fe, #ff0844)' : payload[0].fill }} 
        />
        <span>Signal Volume:</span>
        <span className="text-white font-black tracking-wider text-sm">{fmt(payload[0].value)}</span>
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
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <linearGradient id="gradCyber" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#00f2fe" />
            <stop offset="100%" stopColor="#4facfe" />
          </linearGradient>
          <linearGradient id="gradNeon" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ff0844" />
            <stop offset="100%" stopColor="#ffb199" />
          </linearGradient>
          <linearGradient id="gradSunset" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f83600" />
            <stop offset="100%" stopColor="#f9d423" />
          </linearGradient>
          <linearGradient id="gradAurora" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0ba360" />
            <stop offset="100%" stopColor="#3cba92" />
          </linearGradient>
          <linearGradient id="gradPlasma" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#c471f5" />
            <stop offset="100%" stopColor="#fa71cd" />
          </linearGradient>
          <linearGradient id="gradToxic" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#cc208e" />
            <stop offset="100%" stopColor="#6713d2" />
          </linearGradient>
          <linearGradient id="gradGold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f6d365" />
            <stop offset="100%" stopColor="#fda085" />
          </linearGradient>
          <linearGradient id="gradMagic" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#84fab0" />
            <stop offset="100%" stopColor="#8fd3f4" />
          </linearGradient>
          <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#00f2fe" />
            <stop offset="50%" stopColor="#c471f5" />
            <stop offset="100%" stopColor="#ff0844" />
          </linearGradient>
        </defs>
      </svg>

      <div className="mb-10 relative">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-[#00f2fe] rounded-full mix-blend-screen filter blur-[128px] opacity-20 animate-pulse" />
        <div className="absolute -top-20 right-20 w-64 h-64 bg-[#ff0844] rounded-full mix-blend-screen filter blur-[128px] opacity-20 animate-pulse delay-1000" />
        
        <h1 className="text-4xl md:text-6xl font-black text-white mb-2 tracking-tighter relative z-10">
          Pulse <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f2fe] via-[#c471f5] to-[#ff0844] animate-gradient-x">Telemetry</span>
        </h1>
        <p className="text-slate-400 text-sm font-bold tracking-wide relative z-10">DEEP SCAN NETWORK INTELLIGENCE</p>
      </div>

      {/* Duration filter */}
      <div className="flex items-center gap-1 bg-white/[0.02] backdrop-blur-xl rounded-xl p-1.5 w-full sm:w-fit overflow-x-auto no-scrollbar mb-10 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
        {DURATIONS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setDuration(value)}
            className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all duration-300 whitespace-nowrap ${
              duration === value
                ? 'bg-gradient-to-r from-[#00f2fe]/20 to-[#4facfe]/20 text-[#00f2fe] shadow-[inset_0_0_20px_rgba(0,242,254,0.2)] border border-[#00f2fe]/30'
                : 'text-slate-500 hover:text-white hover:bg-white/[0.05] border border-transparent'
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
          { label: 'Ecosystem Signals', value: loading ? '...' : fmt(data?.total_count || items.length), color: 'from-[#00f2fe] to-[#4facfe]', glow: 'bg-[#00f2fe]' },
          { label: 'Sample Stars Tracked', value: loading ? '...' : fmt(totalStars), color: 'from-[#ff0844] to-[#ffb199]', glow: 'bg-[#ff0844]' },
          { label: 'Average Velocity', value: loading ? '...' : fmt(avgStars), color: 'from-[#f83600] to-[#f9d423]', glow: 'bg-[#f83600]' },
          { label: 'Dominant Framework', value: loading ? '...' : topLang, color: 'from-[#c471f5] to-[#fa71cd]', glow: 'bg-[#c471f5]' },
        ].map((s) => (
          <motion.div 
            key={s.label} 
            whileHover={{ scale: 1.02, y: -4 }}
            className="p-6 rounded-[2rem] bg-[#050914]/50 border border-white/10 flex flex-col justify-between backdrop-blur-2xl relative overflow-hidden group shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
          >
            <div className={`absolute top-0 right-0 w-40 h-40 ${s.glow} opacity-0 group-hover:opacity-20 blur-[64px] transition-opacity duration-700`} />
            <div className={`absolute -inset-px bg-gradient-to-r ${s.color} rounded-[2rem] opacity-0 group-hover:opacity-30 transition-opacity duration-500 blur-md`} />
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 relative z-10">{s.label}</div>
            <div className={`text-4xl md:text-5xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-br ${s.color} relative z-10 drop-shadow-lg`}>
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
          className="bg-[#050914]/60 border border-white/10 backdrop-blur-3xl rounded-[2rem] p-6 sm:p-8 relative overflow-hidden shadow-[0_16px_64px_rgba(0,0,0,0.5)]"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00f2fe] via-[#c471f5] to-[#ff0844]" />
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[#00f2fe] mb-8 drop-shadow-[0_0_8px_rgba(0,242,254,0.8)]">Top Repositories by Star Velocity</h2>
          
          {loading ? (
            <div className="h-64 flex items-center justify-center text-[#c471f5] text-sm font-black uppercase tracking-widest animate-pulse">Calibrating telemetry…</div>
          ) : topRepos.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-slate-600 text-sm font-black uppercase tracking-widest">No signals detected</div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={topRepos} layout="vertical" margin={{ left: 0, right: 20, top: 0, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={110} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                <Bar dataKey="stars" radius={[0, 4, 4, 0]} fill="url(#barGradient)" barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Language doughnut chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#050914]/60 border border-white/10 backdrop-blur-3xl rounded-[2rem] p-6 sm:p-8 relative overflow-hidden shadow-[0_16px_64px_rgba(0,0,0,0.5)]"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#ff0844] via-[#fa71cd] to-[#0ba360]" />
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[#ff0844] mb-8 drop-shadow-[0_0_8px_rgba(255,8,68,0.8)]">Ecosystem Distribution Matrix</h2>
          
          {loading ? (
            <div className="h-64 flex items-center justify-center text-[#fa71cd] text-sm font-black uppercase tracking-widest animate-pulse">Calibrating telemetry…</div>
          ) : langData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-slate-600 text-sm font-black uppercase tracking-widest">No signals detected</div>
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
                  innerRadius={70}
                  paddingAngle={6}
                  stroke="rgba(5,9,20,1)"
                  strokeWidth={6}
                  cornerRadius={8}
                >
                  {langData.map((_, i) => (
                    <Cell key={i} fill={GRADIENTS[i % GRADIENTS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  formatter={(val) => <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-1">{val}</span>}
                  iconType="circle"
                  iconSize={8}
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
        className="bg-[#050914]/60 border border-white/10 backdrop-blur-3xl rounded-[2rem] p-6 sm:p-8 mb-6 relative overflow-hidden shadow-[0_16px_64px_rgba(0,0,0,0.5)]"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#0ba360] to-[#3cba92]" />
        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[#0ba360] mb-8 drop-shadow-[0_0_8px_rgba(11,163,96,0.8)]">Engagement Scatter Vector (Stars vs Forks)</h2>
        
        {loading ? (
          <div className="h-72 flex items-center justify-center text-[#3cba92] text-sm font-black uppercase tracking-widest animate-pulse">Calibrating telemetry…</div>
        ) : scatterData.length === 0 ? (
          <div className="h-72 flex items-center justify-center text-slate-600 text-sm font-black uppercase tracking-widest">No signals detected</div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <ScatterChart margin={{ top: 10, right: 30, bottom: 20, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis 
                type="number" 
                dataKey="x" 
                name="Stars" 
                tick={{ fill: '#64748b', fontSize: 10, fontWeight: 800 }} 
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} 
                tickLine={false}
                tickFormatter={(val) => fmt(val)}
                domain={['auto', 'auto']}
              />
              <YAxis 
                type="number" 
                dataKey="y" 
                name="Forks" 
                tick={{ fill: '#64748b', fontSize: 10, fontWeight: 800 }} 
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} 
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
                      <div className="bg-[#050914]/90 backdrop-blur-2xl px-5 py-4 rounded-2xl text-xs text-white shadow-[0_0_50px_rgba(11,163,96,0.2)] border border-[#0ba360]/30 ring-1 ring-white/5 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#0ba360] to-[#3cba92]" />
                        <div className="font-black text-sm mb-3 text-white tracking-wide drop-shadow-md">{data.name}</div>
                        <div className="flex items-center justify-between gap-6">
                          <div className="flex flex-col">
                            <span className="text-[9px] uppercase tracking-[0.2em] text-slate-500 font-bold mb-1">Stars</span>
                            <span className="text-[#00f2fe] font-black text-sm drop-shadow-[0_0_4px_rgba(0,242,254,0.5)]">{fmt(data.x)}</span>
                          </div>
                          <div className="h-6 w-px bg-white/10" />
                          <div className="flex flex-col">
                            <span className="text-[9px] uppercase tracking-[0.2em] text-slate-500 font-bold mb-1">Forks</span>
                            <span className="text-[#ff0844] font-black text-sm drop-shadow-[0_0_4px_rgba(255,8,68,0.5)]">{fmt(data.y)}</span>
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
                  <Cell key={`cell-${index}`} fill="url(#gradMagic)" opacity={0.8} stroke="#ffffff" strokeWidth={0.5} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        )}
      </motion.div>

      {/* Snapshot info */}
      {data?.date && (
        <div className="mt-8 text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">
          Telemetry Captured: <span className="text-[#00f2fe]">{data.date}</span>
        </div>
      )}
    </Layout>
  )
}

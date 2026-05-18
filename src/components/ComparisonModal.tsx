import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ComparisonModalProps {
  repo1: any
  repo2: any
  onClose: () => void
}

export const ComparisonModal: React.FC<ComparisonModalProps> = ({ repo1, repo2, onClose }) => {
  if (!repo1 || !repo2) return null

  const stats = [
    { label: 'Total Stars', val1: repo1.stars, val2: repo2.stars, fmt: (v: number) => v.toLocaleString() },
    { label: 'Forks', val1: repo1.forks, val2: repo2.forks, fmt: (v: number) => v.toLocaleString() },
    { label: 'Velocity', val1: repo1.rank, val2: repo2.rank, fmt: (v: number) => `#${v}`, inverse: true },
    { label: 'Language', val1: repo1.language, val2: repo2.language, isText: true },
  ]

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/90 backdrop-blur-md"
      />
      
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-4xl bg-[#050914] border border-white/10 rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,1)] overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-indigo-500 animate-gradient-x" />
        
        <div className="p-8 md:p-12">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-2xl font-black text-white tracking-tighter uppercase">Pulse Comparison Matrix</h2>
            <button 
              onClick={onClose}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-8 md:gap-16 relative">
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/5 -translate-x-1/2 hidden md:block" />
            
            {/* Repo 1 */}
            <div className="space-y-8">
              <div className="flex flex-col items-center text-center">
                <div className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-4">Subject Alpha</div>
                <h3 className="text-xl md:text-2xl font-black text-white mb-2">{repo1.name || repo1.full_name}</h3>
                <p className="text-xs text-slate-500 font-medium line-clamp-2 max-w-[200px]">{repo1.description}</p>
              </div>
            </div>

            {/* Repo 2 */}
            <div className="space-y-8">
              <div className="flex flex-col items-center text-center">
                <div className="text-[10px] font-black text-fuchsia-400 uppercase tracking-[0.2em] mb-4">Subject Beta</div>
                <h3 className="text-xl md:text-2xl font-black text-white mb-2">{repo2.name || repo2.full_name}</h3>
                <p className="text-xs text-slate-500 font-medium line-clamp-2 max-w-[200px]">{repo2.description}</p>
              </div>
            </div>
          </div>

          <div className="mt-12 space-y-4">
            {stats.map((stat) => {
              const win1 = stat.inverse ? (stat.val1 < stat.val2) : (stat.val1 > stat.val2)
              const win2 = stat.inverse ? (stat.val2 < stat.val1) : (stat.val2 > stat.val1)
              
              return (
                <div key={stat.label} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 group hover:border-white/10 transition-colors">
                  <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest text-center mb-3 group-hover:text-slate-400 transition-colors">{stat.label}</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className={`text-center text-sm md:text-base font-black tracking-tight ${win1 ? 'text-indigo-400' : 'text-white'}`}>
                      {stat.isText ? stat.val1 : stat.fmt?.(stat.val1) ?? stat.val1}
                      {win1 && !stat.isText && <span className="ml-2 text-[10px] text-indigo-500/50">▲</span>}
                    </div>
                    <div className={`text-center text-sm md:text-base font-black tracking-tight ${win2 ? 'text-fuchsia-400' : 'text-white'}`}>
                      {stat.isText ? stat.val2 : stat.fmt?.(stat.val2) ?? stat.val2}
                      {win2 && !stat.isText && <span className="ml-2 text-[10px] text-fuchsia-500/50">▲</span>}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-12 flex justify-center">
            <button 
              onClick={onClose}
              className="px-8 py-4 bg-white text-black font-black uppercase tracking-widest text-xs rounded-xl hover:scale-105 active:scale-95 transition-transform"
            >
              Terminate Session
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

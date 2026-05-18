import React from 'react'
import { motion } from 'framer-motion'
import { SystemPulse, MomentumSignal } from '@/lib/intelligence'

interface IntelligenceHubProps {
  topSignals: MomentumSignal[]
  pulse: SystemPulse
}

export const IntelligenceHub = ({ topSignals, pulse }: IntelligenceHubProps) => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          
          {/* Intelligence Briefing — Decision Compression */}
          <div className="flex-1 w-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-ping" />
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-indigo-400">Institutional Briefing</h2>
            </div>
            
            <h3 className="text-4xl md:text-5xl font-black text-white mb-8 tracking-tighter leading-tight">
              Market Intelligence <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-fuchsia-400">Trajectory Analysis.</span>
            </h3>
            
            <div className="space-y-6">
              <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-2xl">
                Analyzing <span className="text-white font-bold">{pulse.repoCount} structural telemetry streams</span>. 
                Detected <span className="text-indigo-400 font-bold">{pulse.activeStructuralLeaders.length} validated leaders</span> in the current ecosystem rotation.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl group hover:border-indigo-500/30 transition-colors">
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Confidence Ceiling</div>
                  <div className="text-xl font-black text-white">{Math.round(pulse.avgConfidence)}%</div>
                  <div className="text-[9px] font-bold text-slate-600 uppercase mt-1">Platform Integrity</div>
                </div>
                <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl group hover:border-emerald-500/30 transition-colors">
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Decision Alpha</div>
                  <div className="text-xl font-black text-emerald-400">{Math.round(pulse.avgAttentionScore)}</div>
                  <div className="text-[9px] font-bold text-slate-600 uppercase mt-1">Global Attention Index</div>
                </div>
              </div>
            </div>
          </div>

          {/* Decision Compression — Top 5 Urgent Signals */}
          <div className="w-full lg:w-[450px] shrink-0">
            <div className="bg-[#050914]/90 backdrop-blur-xl border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-transparent" />
              
              <div className="p-8 border-b border-white/5 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-black uppercase tracking-widest text-white">Decision Compression</span>
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter mt-0.5">Top Urgent Structural Shifts</span>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase animate-pulse">Live</span>
              </div>
              
              <div className="divide-y divide-white/5">
                {topSignals.length > 0 ? (
                  topSignals.map((signal, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="p-6 hover:bg-white/[0.02] transition-colors group cursor-crosshair"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                            signal.classification === 'STRUCTURAL_LEADER' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                            signal.classification === 'BREAKOUT' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                            'bg-white/5 text-slate-500 border-white/10'
                          } border`}>
                            {signal.classification?.replace('_', ' ') || 'GENERAL'}
                          </span>
                        </div>
                        <div className="text-[10px] font-black text-slate-500">ATT: {Math.round(signal.attentionScore)}</div>
                      </div>
                      
                      <div className="text-sm font-bold text-white mb-1 group-hover:text-indigo-400 transition-colors">
                        {signal.repo}
                      </div>
                      <div className="text-xs text-slate-500 leading-relaxed font-medium line-clamp-2 italic">
                        &ldquo;{signal.narrative}&rdquo;
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <div className="text-slate-600 text-sm font-bold">Awaiting Market Pulse</div>
                    <div className="text-slate-700 text-xs mt-1">Collecting telemetry for compression...</div>
                  </div>
                )}
              </div>
              
              <div className="p-6 bg-white/[0.02] text-center border-t border-white/5">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">
                  Global Trajectory Assessment Complete
                </span>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  )
}

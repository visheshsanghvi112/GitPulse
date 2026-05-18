import React, { useMemo } from 'react'
import { GetServerSideProps } from 'next'
import Layout from '@/components/Layout'
import { getRepo } from '@/lib/github'
import { computeMomentum, readSnapshots, MomentumSignal, RepoDossier, getRepoDossier, getCalibrationReport, CalibrationReport } from '@/lib/intelligence'

interface DiagnosticsPageProps {
  repo: any
  currentMomentum: MomentumSignal
  dossier: RepoDossier
  calibration: CalibrationReport
}

const SeverityBadge = ({ severity }: { severity: string }) => {
  const colors: Record<string, string> = {
    LOW: 'text-slate-400 bg-slate-400/10 border-slate-400/20',
    MEDIUM: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    HIGH: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
    CRITICAL: 'text-rose-400 bg-rose-400/10 border-rose-400/20',
  }
  return (
    <span className={`px-1.5 py-0.5 rounded text-[8px] font-black border ${colors[severity] || colors.LOW}`}>
      {severity}
    </span>
  )
}

const ModeBadge = ({ mode }: { mode: string }) => {
  const colors: Record<string, string> = {
    DISCOVERY: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    STRUCTURAL: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    VOLATILITY: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    INFRA: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    GENERAL: 'bg-white/5 text-slate-500 border-white/10',
  }
  return (
    <span className={`px-2 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest ${colors[mode] || colors.GENERAL}`}>
      {mode} Mode
    </span>
  )
}

const UrgencyBadge = ({ marker }: { marker: string }) => (
  <span className="px-2 py-1 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[8px] font-black uppercase tracking-widest">
    {marker.replace(/_/g, ' ')}
  </span>
)

export default function DiagnosticsPage({ repo, currentMomentum, dossier, calibration }: DiagnosticsPageProps) {
  if (!repo) return <Layout><div>Repository not found</div></Layout>

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-8 pb-20">
        {/* Stability Mode Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <img src={repo.owner.avatar_url} className="h-16 w-16 rounded-2xl border border-white/10 shadow-2xl" alt="" />
            <div>
              <h1 className="text-3xl font-black text-white tracking-tighter">{repo.full_name}</h1>
              <div className="flex items-center gap-3 mt-1.5">
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Stability Mode Intelligence</p>
                <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[8px] font-black uppercase tracking-widest">
                  Engine v{currentMomentum.engineVersion}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-6">
             <div className="flex flex-col items-end">
               <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Attention Score</span>
               <div className={`text-3xl font-black tracking-tighter ${currentMomentum.attentionScore > 75 ? 'text-rose-500' : 'text-white'}`}>
                 {Math.round(currentMomentum.attentionScore)}
               </div>
             </div>
             <ModeBadge mode={currentMomentum.mode} />
          </div>
        </div>

        {/* Global Calibration Context */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 py-4 px-8 rounded-3xl bg-indigo-500/[0.03] border border-indigo-500/10 shadow-lg">
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">Engine Precision</span>
            <span className="text-lg font-black text-white">{calibration.correctnessRate}%</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">Total Predictions</span>
            <span className="text-lg font-black text-white">{calibration.totalPredictions}</span>
          </div>
          <div className="flex flex-col md:col-span-2">
            <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">Calibration Status</span>
            <span className="text-xs font-medium text-slate-400 italic">V5.9 Calibration Discipline Active. Heuristics frozen for longitudinal validation.</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            {/* Executive Summary & Narrative */}
            <div className="p-10 rounded-[3.5rem] bg-[#050914] border border-white/10 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 p-10 opacity-[0.02] text-[12rem] font-black italic tracking-tighter pointer-events-none uppercase">
                {currentMomentum.classification || 'BASELINE'}
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600">Decision Executive Summary</h3>
                  {currentMomentum.reputation && (
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                      <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">
                        Trusted Pattern ({Math.round(currentMomentum.reputation.reliabilityIndex * 100)}% REL)
                      </span>
                    </div>
                  )}
                </div>
                <div className="text-6xl font-black text-white tracking-tighter uppercase italic mb-8 leading-none">
                  {currentMomentum.classification?.replace('_', ' ') || 'Monitoring'}
                </div>
                <p className="text-slate-400 text-2xl font-medium leading-relaxed italic border-l-4 border-indigo-500/40 pl-8 max-w-3xl">
                  &ldquo;{currentMomentum.narrative}&rdquo;
                </p>
              </div>

              {/* Urgency Ribbons */}
              {currentMomentum.urgencyMarkers.length > 0 && (
                <div className="mt-12 flex flex-wrap gap-3">
                  {currentMomentum.urgencyMarkers.map((m, i) => <UrgencyBadge key={i} marker={m} />)}
                </div>
              )}
            </div>

            {/* Longitudinal Evolution */}
            <div className="p-10 rounded-[3.5rem] bg-[#050914] border border-white/10 shadow-2xl relative">
               <div className="flex items-center justify-between mb-12">
                 <h3 className="text-xs font-black uppercase tracking-[0.4em] text-slate-600">Structural Lifecycle Timeline</h3>
                 <div className="flex flex-col items-end">
                   <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Persistence Rating</span>
                   <span className="text-lg font-black text-emerald-400">{dossier.persistenceRating.toFixed(1)}%</span>
                 </div>
               </div>
               
               <div className="space-y-8 relative">
                 <div className="absolute left-[17px] top-0 bottom-0 w-px bg-white/5" />
                 {dossier.lifecycle.slice(-10).map((l, i) => (
                   <div key={i} className="relative pl-12 group">
                     <div className={`absolute left-[14px] top-1.5 w-2 h-2 rounded-full border-2 border-[#050914] transition-all z-10 ${l.classification ? 'bg-indigo-500 ring-4 ring-indigo-500/10 scale-125' : 'bg-slate-800'}`} />
                     <div className="flex items-center justify-between">
                       <div className="flex items-center gap-6">
                         <span className="text-[10px] font-mono text-slate-600 font-bold">{new Date(l.timestamp).toISOString().slice(5, 16).replace('T', ' ')}</span>
                         <span className={`text-xs font-black uppercase italic ${l.classification ? 'text-white' : 'text-slate-700'}`}>
                           {l.classification?.replace('_', ' ') || 'Baseline'}
                         </span>
                       </div>
                       <div className="flex items-center gap-4">
                          <span className="text-[10px] font-black text-slate-500 tabular-nums">ATT: {Math.round(l.attentionScore)}</span>
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          </div>

          {/* Institutional Integrity Column */}
          <div className="space-y-8">
            {/* Pattern Reputation */}
            <div className="p-8 rounded-[3rem] bg-gradient-to-br from-indigo-500/[0.02] to-transparent border border-white/10 shadow-xl space-y-8">
              <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-6">Pattern Reputation Audit</h4>
              {currentMomentum.reputation ? (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-white uppercase">{currentMomentum.reputation.pattern} Reliability</span>
                    <span className="text-lg font-black text-emerald-400">{Math.round(currentMomentum.reputation.reliabilityIndex * 100)}%</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500/50" style={{ width: `${currentMomentum.reputation.reliabilityIndex * 100}%` }} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                      <div className="text-[8px] font-black text-slate-600 uppercase mb-1">Pattern Hits</div>
                      <div className="text-lg font-black text-white">{currentMomentum.reputation.successCount}</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                      <div className="text-[8px] font-black text-slate-600 uppercase mb-1">Confidence</div>
                      <div className="text-lg font-black text-white">{Math.round((currentMomentum.reputation.successCount / currentMomentum.reputation.totalCount) * 100)}%</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-10 text-center">
                  <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Insufficient Pattern History</span>
                </div>
              )}
            </div>

            {/* Confidence Decomposition */}
            <div className="p-8 rounded-[3rem] bg-[#050914] border border-white/10 space-y-6 shadow-xl">
               <div className="flex items-center justify-between">
                 <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Confidence Audit</span>
                 <span className="text-xl font-black text-indigo-400">{currentMomentum.confidence.score}%</span>
               </div>
               <div className="space-y-5">
                 {[
                   { label: 'Freshness', val: currentMomentum.confidence.breakdown.freshness },
                   { label: 'Completeness', val: currentMomentum.confidence.breakdown.completeness },
                   { label: 'Authenticity', val: currentMomentum.confidence.breakdown.anomalyPenalty },
                   { label: 'Reliability', val: currentMomentum.confidence.breakdown.reliability },
                 ].map((c, i) => (
                   <div key={i}>
                     <div className="flex justify-between items-center mb-1.5">
                       <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{c.label}</span>
                       <span className="text-[9px] font-black text-white">{Math.round(c.val * 100)}%</span>
                     </div>
                     <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                       <div className="h-full bg-indigo-500/50" style={{ width: `${c.val * 100}%` }} />
                     </div>
                   </div>
                 ))}
              </div>
            </div>

            {/* Anomaly Profile */}
            <div className="p-8 rounded-[3rem] bg-rose-500/5 border border-rose-500/10">
              <h4 className="text-[10px] font-black uppercase text-rose-500 tracking-widest mb-4">Structural Threat Audit</h4>
              {currentMomentum.anomalies.length > 0 ? (
                 <div className="space-y-4">
                   {currentMomentum.anomalies.map((a, i) => (
                     <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-rose-500/[0.03] border border-rose-500/10">
                       <SeverityBadge severity={a.severity} />
                       <div>
                         <div className="text-[10px] font-black text-white uppercase tracking-widest">{a.flag}</div>
                         <div className="text-[11px] text-slate-500 mt-1 leading-tight font-medium">{a.description}</div>
                       </div>
                     </div>
                   ))}
                 </div>
              ) : (
                <div className="text-[10px] font-black text-slate-800 uppercase tracking-[0.3em] text-center py-10">No Active Threats</div>
              )}
            </div>
          </div>
        </div>

        {/* High-Fidelity Telemetry Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: 'Velocity (h)', val: `${currentMomentum.velocityPerHour?.toFixed(2) || '—'}` },
            { label: 'EMA (h)', val: `${currentMomentum.emaVelocity?.toFixed(2) || '—'}` },
            { label: 'Fork Vel (h)', val: `${currentMomentum.forkVelocityPerHour?.toFixed(2) || '—'}` },
            { label: 'Acceleration', val: `${currentMomentum.accelerationPerHour?.toFixed(2) || '—'}` },
            { label: 'Persistence', val: `${dossier.persistenceRating.toFixed(0)}%` },
            { label: 'Pattern Trust', val: `${currentMomentum.reputation?.reliabilityIndex ? Math.round(currentMomentum.reputation.reliabilityIndex * 100) : '—'}%` },
            { label: 'Decay Factor', val: `${(currentMomentum.decayFactor * 100).toFixed(0)}%` },
            { label: 'Norm. Vel', val: `${(currentMomentum.normalizedVelocity * 100).toFixed(3)}%` },
          ].map((item, i) => (
            <div key={i} className="p-8 rounded-[2.5rem] bg-white/[0.01] border border-white/5 group hover:bg-white/[0.03] transition-all shadow-lg hover:shadow-indigo-500/5 hover:-translate-y-1">
              <div className="text-[10px] font-black uppercase text-slate-600 mb-3 group-hover:text-indigo-400 transition-colors tracking-widest">{item.label}</div>
              <div className="text-2xl font-black text-white tabular-nums">{item.val}</div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { owner, repo } = context.params as any
  const fullName = `${owner}/${repo}`

  try {
    const repoData = await getRepo(owner, repo)
    const dossier = getRepoDossier(fullName)
    const calibration = getCalibrationReport()
    
    return {
      props: {
        repo: repoData,
        currentMomentum: JSON.parse(JSON.stringify(dossier.currentStats)),
        dossier: JSON.parse(JSON.stringify(dossier)),
        calibration: JSON.parse(JSON.stringify(calibration))
      }
    }
  } catch (err) {
    return { props: {} }
  }
}

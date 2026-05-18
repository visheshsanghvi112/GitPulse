import React from 'react'
import { GetServerSideProps } from 'next'
import Layout from '@/components/Layout'
import { getRepo, getReadme } from '@/lib/github'

// Derived purely from real GitHub API telemetry.
// No fabricated values. Returns null if data is insufficient.
function computePulseSignal(repo: any): { score: string; label: string; color: string } | null {
  if (!repo?.stargazers_count || !repo?.forks_count) return null
  const stars = repo.stargazers_count
  const forks = repo.forks_count
  const issues = repo.open_issues_count ?? 0
  const watchers = repo.subscribers_count ?? 0
  // Fork ratio: how engaged the community is relative to stars
  const forkRatio = forks / Math.max(stars, 1)
  // Engagement ratio: watchers per 1k stars
  const watcherRatio = (watchers / Math.max(stars, 1)) * 100
  // Issue activity: penalise if issues are very high relative to stars (could mean debt)
  const issueRatio = issues / Math.max(stars, 1)
  // Weighted signal: higher fork ratio and watcher ratio = more active community
  const rawSignal = forkRatio * 40 + watcherRatio * 40 - issueRatio * 10
  // Clamp 0-100, round to 1dp
  const score = Math.min(100, Math.max(0, rawSignal)).toFixed(1)
  const n = parseFloat(score)
  if (n >= 70) return { score, label: 'High Community Pull', color: 'text-emerald-400' }
  if (n >= 40) return { score, label: 'Active Engagement', color: 'text-indigo-400' }
  if (n >= 10) return { score, label: 'Growing Traction', color: 'text-yellow-400' }
  return { score, label: 'Early Stage', color: 'text-slate-400' }
}

export default function RepoPage({ repo, readme }: any) {
  if (!repo) return <Layout><div>Repository not found</div></Layout>

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="relative overflow-hidden p-8 md:p-12 rounded-[2.5rem] bg-[#0a0f1c] border border-white/10 shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px]" />
          
          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
            <img src={repo.owner.avatar_url} alt={repo.owner.login} className="h-24 w-24 rounded-3xl shadow-2xl border border-white/10" />
            <div className="flex-1">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
                <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-widest border border-indigo-500/20">Active Subject</span>
                <span className="text-slate-500 text-xs font-bold">{repo.owner.login}</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tighter">{repo.name}</h1>
              <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-2xl">{repo.description}</p>
            </div>
            
            {/* Operator Diagnostics Link */}
            <div className="absolute top-8 right-8 flex items-center gap-2">
              <a 
                href={`/diagnostics/${repo.owner.login}/${repo.name}`}
                className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-[9px] font-black text-slate-500 hover:text-indigo-400 hover:bg-white/10 transition-all uppercase tracking-[0.2em]"
              >
                Diagnostics Matrix
              </a>
            </div>
            
            <div className="shrink-0 flex flex-col items-center p-6 rounded-3xl bg-white/[0.02] border border-white/5">
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Community Signal</div>
              {computePulseSignal(repo) ? (
                <>
                  <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-400 to-fuchsia-400">
                    {computePulseSignal(repo)!.score}
                  </div>
                  <div className={`text-[9px] font-black uppercase tracking-widest mt-1 ${computePulseSignal(repo)!.color}`}>
                    {computePulseSignal(repo)!.label}
                  </div>
                </>
              ) : (
                <>
                  <div className="text-2xl font-black text-slate-600">—</div>
                  <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest mt-1">Collecting Telemetry</div>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
            {[
              { label: 'Stars', val: repo.stargazers_count.toLocaleString(), icon: '⭐' },
              { label: 'Forks', val: repo.forks_count.toLocaleString(), icon: '🍴' },
              { label: 'Subscribers', val: repo.subscribers_count?.toLocaleString() || 'N/A', icon: '🔔' },
              { label: 'Issues', val: repo.open_issues_count.toLocaleString(), icon: '❗' },
            ].map((stat) => (
              <div key={stat.label} className="p-4 rounded-2xl bg-white/[0.01] border border-white/5 text-center">
                <div className="text-xl mb-1">{stat.icon}</div>
                <div className="text-sm font-black text-white">{stat.val}</div>
                <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 p-8 md:p-12 rounded-[2.5rem] bg-[#050914] border border-white/10">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-indigo-400 mb-8">Documentation Preview</h3>
            <div className="prose prose-invert max-w-none prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/5">
              {readme ? (
                <div dangerouslySetInnerHTML={{ __html: readme }} />
              ) : (
                <p className="text-slate-500 italic">No telemetry data available for README.</p>
              )}
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/10">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 mb-6">Subject Attributes</h3>
              <div className="space-y-4">
                {[
                  { label: 'Language', val: repo.language || 'Unknown' },
                  { label: 'License', val: repo.license?.name || 'None' },
                  { label: 'Visibility', val: repo.visibility },
                  { label: 'Created', val: new Date(repo.created_at).toLocaleDateString() },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-[10px] font-black text-slate-600 uppercase">{item.label}</span>
                    <span className="text-xs font-bold text-white">{item.val}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <a 
              href={repo.html_url} 
              target="_blank" 
              rel="noreferrer"
              className="block w-full p-6 rounded-[2rem] bg-white text-black text-center font-black uppercase tracking-[0.2em] text-xs hover:scale-[1.02] transition-transform"
            >
              Open in Matrix →
            </a>
            <a 
              href={`/diagnostics/${repo.owner.login}/${repo.name}`}
              className="block w-full p-4 rounded-[2rem] bg-white/5 border border-white/10 text-slate-500 text-center font-black uppercase tracking-[0.2em] text-[10px] hover:text-indigo-400 transition-colors mt-4"
            >
              Intelligence Diagnostics Matrix
            </a>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { owner, repo } = context.params as any
  try {
    const data = await getRepo(owner, repo)
    const readme = await getReadme(owner, repo)
    // readme is raw markdown; a real app would render markdown to HTML server-side
    return { props: { repo: data, readme } }
  } catch (err) {
    return { props: {} }
  }
}

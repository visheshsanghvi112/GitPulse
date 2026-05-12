import React from 'react'
import { motion } from 'framer-motion'
import Badge from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import useTilt from '@/components/animations/useTilt'

type Repo = {
  id: number | string
  name: string
  full_name?: string
  description?: string
  stargazers_count?: number
  forks_count?: number
  language?: string
  owner: { login: string; avatar_url?: string }
  html_url: string
  pushed_at?: string
}

function fmt(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

export const RepoCardAdvanced: React.FC<{ repo?: Repo; skeleton?: boolean }> = ({ repo, skeleton = false }) => {
  const tiltRef = useTilt(!!repo)

  if (skeleton) {
    return (
      <div className="glass p-5 rounded-2xl w-full">
        <div className="flex gap-4">
          <Skeleton className="h-10 w-10 rounded-lg flex-shrink-0" />
          <div className="flex-1 space-y-2.5">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-5/6" />
            <Skeleton className="h-3 w-4/6" />
            <div className="flex gap-2 pt-1">
              <Skeleton className="h-5 w-14 rounded-full" />
              <Skeleton className="h-5 w-10 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!repo) return null

  const stars = repo.stargazers_count ?? 0
  const forks = repo.forks_count ?? 0
  const updatedAt = repo.pushed_at
    ? new Date(repo.pushed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : null

  return (
    <motion.a
      ref={tiltRef as any}
      href={repo.html_url}
      target="_blank"
      rel="noreferrer"
      className="block transform-gpu"
      whileHover={{ scale: 1.015, y: -2 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
    >
      <div
        className="glass p-5 rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-indigo-900/20 transition-all duration-300 relative overflow-hidden h-full"
        style={{
          transform: 'perspective(1000px) rotateX(calc((var(--py,0.5)-0.5) * 5deg)) rotateY(calc((var(--px,0.5)-0.5) * -5deg))'
        }}
      >
        {/* Subtle inner glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/[0.06] to-pink-500/[0.04] pointer-events-none rounded-2xl" />

        <div className="relative z-10 flex items-start gap-3">
          {/* Avatar */}
          <img
            src={repo.owner.avatar_url || `https://avatars.githubusercontent.com/u/0?v=4`}
            alt={repo.owner.login}
            className="h-10 w-10 rounded-lg ring-1 ring-white/10 flex-shrink-0 bg-slate-800"
            onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${repo.owner.login}&background=6366f1&color=fff&size=40` }}
          />

          <div className="flex-1 min-w-0">
            {/* Repo name */}
            <div className="font-semibold text-white text-sm leading-snug truncate">
              {repo.full_name ?? `${repo.owner.login}/${repo.name}`}
            </div>

            {/* Description */}
            {repo.description && (
              <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">
                {repo.description}
              </p>
            )}

            {/* Stats row */}
            <div className="mt-3 flex items-center gap-3 flex-wrap">
              <span className="flex items-center gap-1 text-xs text-yellow-400 font-medium">
                <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {fmt(stars)}
              </span>

              <span className="flex items-center gap-1 text-xs text-slate-400">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                {fmt(forks)}
              </span>

              {repo.language && <Badge>{repo.language}</Badge>}

              {updatedAt && (
                <span className="ml-auto text-[10px] text-slate-500">{updatedAt}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.a>
  )
}

export default RepoCardAdvanced

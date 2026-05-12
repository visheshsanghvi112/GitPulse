import React from 'react'
import Link from 'next/link'

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
}

export const RepoCard: React.FC<{ repo: Repo }> = ({ repo }) => {
  return (
    <div className="glass p-4 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-200">
      <div className="flex items-start gap-4">
        <img src={repo.owner.avatar_url} alt={repo.owner.login} className="h-12 w-12 rounded-md" />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <Link href={`/repo/${repo.owner.login}/${repo.name}`} className="text-lg font-semibold hover:underline">
              {repo.full_name ?? `${repo.owner.login}/${repo.name}`}
            </Link>
            <a href={repo.html_url} target="_blank" rel="noreferrer" className="text-sm opacity-70">
              GitHub
            </a>
          </div>
          <p className="text-sm mt-1 text-slate-300">{repo.description}</p>
          <div className="mt-3 flex items-center gap-3 text-xs text-slate-400">
            <div>★ {repo.stargazers_count ?? 0}</div>
            <div>Forks: {repo.forks_count ?? 0}</div>
            {repo.language && <div className="px-2 py-1 bg-white/5 rounded">{repo.language}</div>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default RepoCard

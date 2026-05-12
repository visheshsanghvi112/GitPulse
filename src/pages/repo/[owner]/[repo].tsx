import React from 'react'
import { GetServerSideProps } from 'next'
import Layout from '@/components/Layout'
import { getRepo, getReadme } from '@/lib/github'

export default function RepoPage({ repo, readme }: any) {
  if (!repo) return <Layout><div>Repository not found</div></Layout>

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="glass p-6 rounded-xl">
          <div className="flex items-center gap-4">
            <img src={repo.owner.avatar_url} alt={repo.owner.login} className="h-16 w-16 rounded" />
            <div>
              <h2 className="text-2xl font-bold">{repo.full_name}</h2>
              <p className="text-sm text-slate-300">{repo.description}</p>
            </div>
          </div>
        </div>

        <div className="glass p-6 rounded-xl">
          <h3 className="font-semibold">README Preview</h3>
          <div className="mt-3 prose prose-invert max-w-none">
            {readme ? (
              <div dangerouslySetInnerHTML={{ __html: readme }} />
            ) : (
              <p className="text-slate-400">No README available</p>
            )}
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

import axios from 'axios'

const GITHUB_TOKEN = process.env.GITHUB_TOKEN
const api = axios.create({
  baseURL: 'https://api.github.com',
  headers: GITHUB_TOKEN ? { Authorization: `token ${GITHUB_TOKEN}` } : undefined
})

export async function searchTrending({
  q,
  sort = 'stars',
  order = 'desc',
  per_page = 30,
  page = 1
}: {
  q: string
  sort?: string
  order?: string
  per_page?: number
  page?: number
}) {
  // Uses GitHub Search API to approximate trending results
  const resp = await api.get('/search/repositories', {
    params: { q, sort, order, per_page, page }
  })
  return resp.data
}

export async function getRepo(owner: string, repo: string) {
  const resp = await api.get(`/repos/${owner}/${repo}`)
  return resp.data
}

export async function getReadme(owner: string, repo: string) {
  try {
    const resp = await api.get(`/repos/${owner}/${repo}/readme`, {
      headers: { Accept: 'application/vnd.github.v3.raw' }
    })
    return resp.data
  } catch (err) {
    return null
  }
}

const fs = require('fs')
const path = require('path')
const axios = require('axios')

const GITHUB_TOKEN = process.env.GITHUB_TOKEN
if (!GITHUB_TOKEN) {
  console.warn('GITHUB_TOKEN not set — fetches will be rate limited')
}

const client = axios.create({
  baseURL: 'https://api.github.com',
  headers: GITHUB_TOKEN ? { Authorization: `token ${GITHUB_TOKEN}` } : {},
  timeout: 30000
})

async function retry(fn, attempts = 5) {
  let lastErr
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn()
    } catch (err) {
      lastErr = err
      const wait = Math.min(30000, 500 * Math.pow(2, i))
      console.warn(`Attempt ${i + 1} failed — retrying in ${wait}ms`, err.message || err)
      await new Promise((r) => setTimeout(r, wait))
    }
  }
  throw lastErr
}

function sinceDateFor(duration) {
  const now = new Date()
  const since = new Date(now)
  if (duration === 'today') since.setDate(now.getDate() - 1)
  else if (duration === 'month') since.setMonth(now.getMonth() - 1)
  else since.setDate(now.getDate() - 7)
  return since.toISOString().split('T')[0]
}

async function fetchTrending(duration) {
  const since = sinceDateFor(duration)
  const q = `created:>${since}`
  const params = { q, sort: 'stars', order: 'desc', per_page: 100 }
  const fn = async () => {
    const res = await client.get('/search/repositories', { params })
    if (res.status === 200) return res.data
    const err = new Error(`GitHub responded ${res.status}`)
    err.status = res.status
    throw err
  }
  return retry(fn, 5)
}

async function main() {
  const outDir = path.join(process.cwd(), 'data', 'daily')
  fs.mkdirSync(outDir, { recursive: true })
  const durations = ['today', 'week', 'month']
  const date = new Date().toISOString().slice(0, 10)
  const snapshot = { date, durations: {} }
  for (const d of durations) {
    try {
      console.log(`Fetching ${d}…`)
      const data = await fetchTrending(d)
      snapshot.durations[d] = {
        total_count: data.total_count,
        items: data.items.map((r) => ({
          id: r.id,
          name: r.name,
          full_name: r.full_name,
          description: r.description,
          html_url: r.html_url,
          stargazers_count: r.stargazers_count,
          forks_count: r.forks_count,
          language: r.language,
          owner: { login: r.owner.login, avatar_url: r.owner.avatar_url },
          pushed_at: r.pushed_at
        }))
      }
    } catch (err) {
      console.error(`Failed to fetch ${d}:`, err.message || err)
      // do not overwrite existing file if fetch fails — keep stale data
      snapshot.durations[d] = { error: String(err.message || err), items: [] }
    }
  }

  const outPath = path.join(outDir, `trending-${date}.json`)
  fs.writeFileSync(outPath, JSON.stringify(snapshot, null, 2), 'utf-8')
  console.log('Wrote snapshot to', outPath)
}

if (require.main === module) main().catch((e) => { console.error(e); process.exit(1) })

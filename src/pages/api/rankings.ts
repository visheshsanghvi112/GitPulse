import type { NextApiRequest, NextApiResponse } from 'next'
import { searchTrending } from '@/lib/github'
import { getCategoryRepos, getAvailableCategories } from '@/lib/parseRanking'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { category = 'stars', limit = '100', q } = req.query

    const cat = String(category)
    const lim = Math.min(parseInt(String(limit), 10) || 100, 100)

    // Return list of available categories
    if (cat === '__categories__') {
      const cats = getAvailableCategories()
      res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=7200')
      return res.status(200).json({ categories: ['stars', 'forks', ...cats] })
    }

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=7200')

    try {
      // 1. ATTEMPT LIVE FETCH (Primary Strategy)
      let searchQuery = ''
      let sort = 'stars'

      if (cat === 'stars') {
        searchQuery = 'stars:>1000'
      } else if (cat === 'forks') {
        searchQuery = 'forks:>1000'
        sort = 'forks'
      } else {
        searchQuery = `language:${cat} stars:>10`
      }

      if (q) {
        searchQuery += ` ${String(q)}`
      }

      const data = await searchTrending({
        q: searchQuery,
        sort,
        order: 'desc',
        per_page: lim
      })

      const liveRepos = data.items.map((repo: any, i: number) => ({
        id: repo.id,
        rank: i + 1,
        name: repo.name,
        full_name: repo.full_name,
        owner: repo.owner.login,
        description: repo.description,
        language: repo.language,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        html_url: repo.html_url,
      }))

      return res.status(200).json({
        category: cat,
        total: data.total_count,
        items: liveRepos,
        source: 'live-github-api'
      })

    } catch (apiErr) {
      console.warn('[rankings api] Live fetch failed or rate limited. Falling back to local data.', apiErr)
      
      // 2. FALLBACK TO SNAPSHOT (Secondary Strategy)
      let repos = getCategoryRepos(cat)

      if (q) {
        const qStr = String(q).toLowerCase()
        repos = repos.filter(
          (r) =>
            r.name.toLowerCase().includes(qStr) ||
            r.description?.toLowerCase().includes(qStr) ||
            r.owner.toLowerCase().includes(qStr)
        )
      }

      return res.status(200).json({
        category: cat,
        total: repos.length,
        items: repos.slice(0, lim),
        source: 'snapshot-fallback'
      })
    }

  } catch (err: any) {
    console.error('[rankings api] Fatal Error', err)
    return res.status(500).json({ message: 'Failed to load rankings', error: String(err?.message) })
  }
}

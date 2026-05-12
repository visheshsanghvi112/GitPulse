import type { NextApiRequest, NextApiResponse } from 'next'
import { getCategoryRepos, getAvailableCategories } from '@/lib/parseRanking'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
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

    let repos = getCategoryRepos(cat)

    // Optional search filter
    if (q) {
      const qStr = String(q).toLowerCase()
      repos = repos.filter(
        (r) =>
          r.name.toLowerCase().includes(qStr) ||
          r.description?.toLowerCase().includes(qStr) ||
          r.owner.toLowerCase().includes(qStr)
      )
    }

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=7200')
    return res.status(200).json({
      category: cat,
      total: repos.length,
      items: repos.slice(0, lim),
    })
  } catch (err: any) {
    console.error('[rankings api]', err)
    return res.status(500).json({ message: 'Failed to load rankings', error: String(err?.message) })
  }
}

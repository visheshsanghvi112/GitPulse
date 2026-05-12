import type { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'
import { searchTrending } from '@/lib/github'

function latestSnapshotFile() {
  const dir = path.join(process.cwd(), 'data', 'daily')
  if (!fs.existsSync(dir)) return null
  const files = fs.readdirSync(dir)
    .filter((f) => f.startsWith('trending-') && f.endsWith('.json'))
  if (!files.length) return null
  files.sort()
  return path.join(dir, files[files.length - 1])
}

function getSnapshotData(duration: string) {
  const snapshotFile = latestSnapshotFile()
  if (!snapshotFile) return null
  try {
    const raw = fs.readFileSync(snapshotFile, 'utf-8')
    const snapshot = JSON.parse(raw)
    return snapshot?.durations?.[duration] ?? null
  } catch {
    return null
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { duration = 'week', language, q, page = '1' } = req.query
    const dur = String(duration)
    const hasToken = !!process.env.GITHUB_TOKEN

    // ── LIVE FETCH (when token is available) ──────────────────────────────
    if (hasToken) {
      const now = new Date()
      let since = new Date()
      if (dur === 'today') {
        since.setDate(now.getDate() - 1)
      } else if (dur === 'month') {
        since.setMonth(now.getMonth() - 1)
      } else {
        // 'week'
        since.setDate(now.getDate() - 7)
      }
      const sinceStr = since.toISOString().split('T')[0]

      // Build query: active repositories with high star counts
      let qstr = `pushed:>${sinceStr} stars:>500`
      if (language) qstr += ` language:${language}`
      if (q) qstr += ` ${q}`

      try {
        const data = await searchTrending({
          q: qstr,
          sort: 'stars',
          order: 'desc',
          per_page: 100,
          page: Number(page),
        })
        res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate=300')
        return res.status(200).json(data)
      } catch (liveErr: any) {
        console.warn('[trending] Live fetch failed, falling back to snapshot:', liveErr?.message)
        // fall through to snapshot
      }
    }

    // ── SNAPSHOT FALLBACK (no token, or live fetch failed) ─────────────────
    const snapshotData = getSnapshotData(dur)
    if (snapshotData) {
      res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600')
      return res.status(200).json(snapshotData)
    }

    // ── ABSOLUTE FALLBACK: empty but valid shape ────────────────────────────
    return res.status(200).json({
      total_count: 0,
      items: [],
      _source: 'no-data',
      _hint: hasToken
        ? 'GitHub API returned no results'
        : 'Set GITHUB_TOKEN in .env.local for live data',
    })
  } catch (err: any) {
    console.error('[trending api]', err)
    if (err?.response?.status === 403 || err?.response?.status === 429) {
      return res.status(429).json({
        message: 'GitHub API rate limit exceeded. Token needed or try again later.',
      })
    }
    res.status(500).json({ message: 'Server error', error: String(err?.message) })
  }
}

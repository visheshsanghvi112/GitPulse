/**
 * api/trending.ts  —  Trending Data API Route
 *
 * Pipeline (in priority order):
 *   1. Live scraper (getRealTrending) — real GitHub Trending DOM order
 *   2. Search API fallback (language/query filters, or when scraper fails)
 *   3. Daily snapshot fallback (stale-but-valid cached data)
 *   4. Empty response (valid shape, never errors)
 *
 * API FAILURE HANDLING:
 *   - Scraper failure → fallback to Search API, never block
 *   - Enrichment failure → partial data preserved (see github.ts)
 *   - Rate limit (403/429) → cached fallback, explicit hint to client
 *   - Malformed JSON → caught at parse boundary, empty response returned
 *
 * CACHING STRATEGY:
 *   - Scraper result: s-maxage=120, stale-while-revalidate=300
 *   - Search API result: s-maxage=300, stale-while-revalidate=600
 *   - Snapshot fallback: s-maxage=600, stale-while-revalidate=1800
 *
 * IMPORTANT: DOM order from scraper is NEVER re-sorted.
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'
import { getRealTrending, searchTrending } from '@/lib/github'
import { ingestTrendingItem, safeParseInt } from '@/lib/intelligence'

// ── In-memory scrape cooldown (prevent hammering during a request burst) ──────
const SCRAPE_COOLDOWN_MS = 60 * 1000   // 1 minute minimum between scrapes
let lastScrapeAt = 0

// ── Snapshot fallback ─────────────────────────────────────────────────────────

function latestSnapshotFile(): string | null {
  const dir = path.join(process.cwd(), 'data', 'daily')
  if (!fs.existsSync(dir)) return null
  try {
    const files = fs.readdirSync(dir)
      .filter((f) => f.startsWith('trending-') && f.endsWith('.json'))
    if (!files.length) return null
    files.sort()
    return path.join(dir, files[files.length - 1])
  } catch {
    return null
  }
}

function getSnapshotData(duration: string): any | null {
  const snapshotFile = latestSnapshotFile()
  if (!snapshotFile) return null
  try {
    const raw = fs.readFileSync(snapshotFile, 'utf-8')
    const snapshot = JSON.parse(raw)
    return snapshot?.durations?.[duration] ?? null
  } catch {
    // Malformed snapshot — do not propagate
    console.warn('[trending api] Snapshot file corrupted or malformed')
    return null
  }
}

// ── Rate limit detection ──────────────────────────────────────────────────────

function isRateLimitError(err: any): boolean {
  return err?.response?.status === 403 || err?.response?.status === 429
}

// ── Main Handler ──────────────────────────────────────────────────────────────

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { duration = 'week', language, q, page = '1' } = req.query
    const dur = String(duration)
    const hasToken = !!process.env.GITHUB_TOKEN
    const now = Date.now()

    // ── 1. LIVE SCRAPER ───────────────────────────────────────────────────────
    // Only for unfiltered requests (no language/query param) — scraper doesn't
    // support server-side filtering, that's the Search API's role.
    // DOM order is the ranking truth. Do NOT re-sort after ingestion.
    if (hasToken && !language && !q) {
      const withinCooldown = (now - lastScrapeAt) < SCRAPE_COOLDOWN_MS
      if (!withinCooldown) {
        try {
          const scraperDuration = dur === 'today' ? 'daily' : dur === 'month' ? 'monthly' : 'weekly'
          const data = await getRealTrending(scraperDuration as any)

          if (data && data._health.status !== 'FAILURE') {
            lastScrapeAt = now

            // Ingest snapshots — non-critical, never blocks response
            for (const item of data.items ?? []) {
              try { ingestTrendingItem(item) } catch { /* non-critical */ }
            }

            res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate=300')
            return res.status(200).json(data)
          }

          if (data?._health.status === 'PARTIAL_FAILURE') {
            // Partial data is still usable — emit with health context
            lastScrapeAt = now
            for (const item of data.items ?? []) {
              try { ingestTrendingItem(item) } catch { /* non-critical */ }
            }
            res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120')
            return res.status(200).json({ ...data, _warning: 'partial_scrape' })
          }

          console.warn('[trending api] Scraper returned null or FAILURE — falling through to Search API')
        } catch (scraperErr: any) {
          if (isRateLimitError(scraperErr)) {
            console.warn('[trending api] Scraper rate limited — falling through to snapshot')
            const snapshotData = getSnapshotData(dur)
            if (snapshotData) {
              res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=1800')
              return res.status(200).json({ ...snapshotData, _source: 'snapshot_rate_limit_fallback' })
            }
          }
          console.warn('[trending api] Scraper threw:', scraperErr?.message)
        }
      } else {
        console.info('[trending api] Scrape cooldown active — skipping scraper')
      }
    }

    // ── 2. SEARCH API (filtered requests, or scraper fallback) ────────────────
    if (hasToken) {
      const nowDate = new Date()
      let since = new Date(nowDate)
      if (dur === 'today') {
        since.setDate(nowDate.getDate() - 10)
      } else if (dur === 'month') {
        since.setMonth(nowDate.getMonth() - 3)
      } else {
        since.setDate(nowDate.getDate() - 30)
      }
      const sinceStr = since.toISOString().split('T')[0]

      let qstr = `created:>${sinceStr} stars:>10`
      if (language) qstr += ` language:${language}`
      if (q) qstr += ` ${q}`

      const pageNum = safeParseInt(page) ?? 1

      try {
        const data = await searchTrending({
          q: qstr,
          sort: 'stars',
          order: 'desc',
          per_page: 50,
          page: pageNum,
        })
        res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600')
        return res.status(200).json({ ...data, _source: 'search_api' })
      } catch (searchErr: any) {
        if (isRateLimitError(searchErr)) {
          console.warn('[trending api] Search API rate limited — falling through to snapshot')
        } else {
          console.warn('[trending api] Search API failed:', searchErr?.message)
        }
        // Fall through to snapshot
      }
    }

    // ── 3. SNAPSHOT FALLBACK ──────────────────────────────────────────────────
    const snapshotData = getSnapshotData(dur)
    if (snapshotData) {
      res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=1800')
      return res.status(200).json({ ...snapshotData, _source: 'snapshot_fallback' })
    }

    // ── 4. EMPTY (valid shape) ────────────────────────────────────────────────
    return res.status(200).json({
      total_count: 0,
      items: [],
      _source: 'no-data',
      _hint: hasToken
        ? 'All sources unavailable. GitHub API may be experiencing issues.'
        : 'Set GITHUB_TOKEN in .env.local for live data.',
    })

  } catch (err: any) {
    console.error('[trending api] Unhandled error:', err)

    // Rate limit: communicate clearly to client, do not 500
    if (isRateLimitError(err)) {
      return res.status(429).json({
        message: 'GitHub API rate limit exceeded.',
        _hint: 'Retry after 60 seconds or check your GITHUB_TOKEN quota.',
      })
    }

    // Malformed JSON or other parse errors: return empty, never crash
    return res.status(200).json({
      total_count: 0,
      items: [],
      _source: 'error_fallback',
      _error: process.env.NODE_ENV === 'development' ? String(err?.message) : 'internal_error',
    })
  }
}

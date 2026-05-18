/**
 * github.ts  —  GitPulse Data Access Layer
 *
 * Responsibilities:
 *   1. GitHub REST API calls (getRepo, getReadme, searchTrending)
 *   2. GitHub Trending scraper (getRealTrending) — resilient, health-monitored
 *
 * SCRAPER INVARIANTS:
 *   - Selector fallback chain: primary → secondary → tertiary
 *   - Every extracted row emits extraction confidence
 *   - If 0 repos extracted: returns FAILURE status (never silently continues)
 *   - If <50% of expected repos extracted: returns PARTIAL_FAILURE
 *   - Rate-limit and CAPTCHA page detection
 *   - DOM order is NEVER re-sorted after extraction
 */

import axios, { AxiosError } from 'axios'
import type { ScrapeHealth } from './intelligence'
import { safeParseInt } from './intelligence'

const GITHUB_TOKEN = process.env.GITHUB_TOKEN

const api = axios.create({
  baseURL: 'https://api.github.com',
  headers: GITHUB_TOKEN ? { Authorization: `token ${GITHUB_TOKEN}` } : undefined,
  timeout: 15000,
})

// ─────────────────────────────────────────────────────────────────────────────
// SCRAPER RESILIENCE LAYER
// ─────────────────────────────────────────────────────────────────────────────

const EXPECTED_TRENDING_COUNT = 25
const SCRAPER_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'

/**
 * Detect if GitHub returned a rate-limit or CAPTCHA page instead of content.
 */
function detectBlockPage(html: string): 'rate_limit' | 'captcha' | null {
  if (html.includes('rate limit') && html.includes('429')) return 'rate_limit'
  if (html.includes('Too Many Requests')) return 'rate_limit'
  if (html.includes('captcha') || html.includes('Are you a robot')) return 'captcha'
  return null
}

/**
 * Primary selector: GitHub's Box-row article structure.
 * Returns null if no rows found.
 */
function extractRows_primary(html: string): RegExpMatchArray[] | null {
  const rowRegex = /<article[^>]*class="[^"]*Box-row[^"]*"[^>]*>([\s\S]*?)<\/article>/g
  const rows = [...html.matchAll(rowRegex)]
  return rows.length > 0 ? rows : null
}

/**
 * Secondary selector: li-based trending row (GitHub has used this in the past).
 */
function extractRows_secondary(html: string): RegExpMatchArray[] | null {
  const rowRegex = /<li[^>]*class="[^"]*Box-row[^"]*"[^>]*>([\s\S]*?)<\/li>/g
  const rows = [...html.matchAll(rowRegex)]
  return rows.length > 0 ? rows : null
}

/**
 * Tertiary selector: any div with repository link pattern.
 * Least reliable — flagged as LOW extraction confidence.
 */
function extractRows_tertiary(html: string): RegExpMatchArray[] | null {
  const rowRegex = /<(?:article|li|div)[^>]*>([\s\S]*?href="\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+"[\s\S]*?)<\/(?:article|li|div)>/g
  const rows = [...html.matchAll(rowRegex)]
  // Filter to only rows that have star velocity text
  const filtered = rows.filter(m => /stars (today|this week|this month)/.test(m[1]))
  return filtered.length > 0 ? filtered : null
}

interface RowExtractionResult {
  path: string
  velocity: string | null
  official_rank: number
  selectorTier: 1 | 2 | 3
}

function parseRow(rowHtml: string, index: number): RowExtractionResult | null {
  // Path extraction: find /owner/repo pattern
  const pathMatch = rowHtml.match(/href="\/([a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+)"/)
  if (!pathMatch) return null

  const path = pathMatch[1]
  // Exclude non-repo paths
  if (path.startsWith('sponsors/') || path.startsWith('site/') || path.startsWith('topics/') || path.startsWith('collections/')) {
    return null
  }
  // Must look like owner/repo (two segments only)
  if (path.split('/').length !== 2) return null

  // Velocity extraction with fallback patterns
  const velocityMatch =
    rowHtml.match(/([\d,]+\s+stars\s+today)/) ||
    rowHtml.match(/([\d,]+\s+stars\s+this\s+week)/) ||
    rowHtml.match(/([\d,]+\s+stars\s+this\s+month)/)
  const velocity = velocityMatch ? velocityMatch[1].trim() : null

  return { path, velocity, official_rank: index + 1, selectorTier: 1 }
}

export interface TrendingResult {
  total_count: number
  items: any[]
  _scanned_at: string
  _source: string
  _health: ScrapeHealth
}

export async function getRealTrending(
  duration: 'daily' | 'weekly' | 'monthly' = 'daily'
): Promise<TrendingResult | null> {
  const since = duration
  let html: string

  try {
    const resp = await axios.get(`https://github.com/trending?since=${since}`, {
      headers: { 'User-Agent': SCRAPER_USER_AGENT },
      timeout: 15000,
    })
    html = resp.data
  } catch (err) {
    console.error('[scraper] HTTP request failed:', (err as AxiosError).message)
    return null
  }

  // Block page detection
  const blockType = detectBlockPage(html)
  if (blockType === 'rate_limit') {
    console.warn('[scraper] GitHub rate limit page detected')
    return null
  }
  if (blockType === 'captcha') {
    console.warn('[scraper] GitHub CAPTCHA page detected')
    return null
  }

  // Selector fallback chain
  let rawRows: RegExpMatchArray[] | null = null
  let selectorTier: 1 | 2 | 3 = 1

  rawRows = extractRows_primary(html)
  if (!rawRows) {
    selectorTier = 2
    rawRows = extractRows_secondary(html)
    console.warn('[scraper] Primary selector failed, using secondary selector')
  }
  if (!rawRows) {
    selectorTier = 3
    rawRows = extractRows_tertiary(html)
    console.warn('[scraper] Secondary selector failed, using tertiary selector')
  }
  if (!rawRows || rawRows.length === 0) {
    console.error('[scraper] All selectors failed — no rows extracted')
    return null
  }

  // Row parsing
  const warnings: string[] = []
  const extractedMeta: RowExtractionResult[] = []
  let rowIndex = 0

  for (const row of rawRows) {
    const parsed = parseRow(row[1], rowIndex)
    if (!parsed) {
      warnings.push(`row_${rowIndex}_parse_failed`)
    } else {
      parsed.official_rank = extractedMeta.length + 1  // re-rank after filtering
      parsed.selectorTier = selectorTier as 1 | 2 | 3
      extractedMeta.push(parsed)
    }
    rowIndex++
  }

  if (extractedMeta.length === 0) {
    console.error('[scraper] No valid repos after parsing all rows')
    return null
  }

  // Health assessment
  const missingVelocity = extractedMeta.filter(m => !m.velocity).length
  const missingPaths = rawRows.length - extractedMeta.length
  const extractionRate = extractedMeta.length / EXPECTED_TRENDING_COUNT
  const extractionConfidence = Math.round(clamp(extractionRate, 0, 1) * 100)

  let status: ScrapeHealth['status'] = 'OK'
  if (extractedMeta.length === 0) {
    status = 'FAILURE'
  } else if (extractedMeta.length < EXPECTED_TRENDING_COUNT * 0.5) {
    status = 'PARTIAL_FAILURE'
    warnings.push(`low_extraction_count: ${extractedMeta.length}/${EXPECTED_TRENDING_COUNT}`)
  }
  if (selectorTier > 1) {
    warnings.push(`selector_tier_${selectorTier}_used`)
    if (status === 'OK') status = 'PARTIAL_FAILURE'
  }
  if (missingVelocity > 0) warnings.push(`missing_velocity_count: ${missingVelocity}`)

  const health: ScrapeHealth = {
    status,
    reposExtracted: extractedMeta.length,
    missingVelocity,
    missingPaths,
    extractionConfidence,
    warnings,
  }

  // Log health summary
  console.info(`[scraper] status=${status} extracted=${extractedMeta.length} confidence=${extractionConfidence}% tier=${selectorTier} warnings=${warnings.length}`)

  // If PARTIAL_FAILURE: continue with partial data (do not silently fail)
  // If FAILURE: already returned null above
  if (status === 'FAILURE') return null

  // Enrich from GitHub API — DOM order is the ranking truth, preserved here
  const enriched = await Promise.all(
    extractedMeta.slice(0, EXPECTED_TRENDING_COUNT).map(async (meta) => {
      const [owner, name] = meta.path.split('/')
      try {
        const repoData = await getRepo(owner, name)
        return {
          ...repoData,
          trending_velocity: meta.velocity,
          _velocity_period: duration,   // 'daily' | 'weekly' | 'monthly' — provenance
          official_rank: meta.official_rank,
          _extraction_tier: meta.selectorTier,
        }
      } catch {
        // Enrichment failed — preserve scraper data only, never block the pipeline
        return {
          full_name: meta.path,
          name,
          owner: { login: owner, avatar_url: null },
          trending_velocity: meta.velocity,
          _velocity_period: duration,   // provenance preserved even on enrichment failure
          official_rank: meta.official_rank,
          stargazers_count: null,
          forks_count: null,
          description: null,
          language: null,
          html_url: `https://github.com/${meta.path}`,
          _enrichment_failed: true,
          _extraction_tier: meta.selectorTier,
        }
      }
    })
  )

  // Filter nulls (should not happen but be defensive)
  const items = enriched.filter(Boolean)

  return {
    total_count: items.length,
    items,
    _scanned_at: new Date().toISOString(),
    _source: 'GitHub Official Trending',
    _health: health,
  }
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}

// ─────────────────────────────────────────────────────────────────────────────
// GITHUB REST API
// ─────────────────────────────────────────────────────────────────────────────

export async function searchTrending({
  q,
  sort = 'stars',
  order = 'desc',
  per_page = 30,
  page = 1,
}: {
  q: string
  sort?: string
  order?: string
  per_page?: number
  page?: number
}) {
  const resp = await api.get('/search/repositories', {
    params: { q, sort, order, per_page, page },
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
      headers: { Accept: 'application/vnd.github.v3.raw' },
    })
    return resp.data
  } catch {
    return null
  }
}

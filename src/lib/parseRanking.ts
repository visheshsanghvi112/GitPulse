import fs from 'fs'
import path from 'path'

export interface RankedRepo {
  rank: number
  name: string
  owner: string
  full_name: string
  html_url: string
  stars: number
  forks: number
  language: string | null
  open_issues: number
  description: string
  pushed_at: string
}

const TOP100_DIR = path.join(process.cwd(), 'external', 'Github-Ranking', 'Top100')

/** Parse a single row from the markdown table */
function parseRow(line: string, index: number): RankedRepo | null {
  // | 1 | [name](url) | 500000 | 47000 | Python | 100 | Description | 2026-01-01T00:00:00Z |
  const cols = line.split('|').map((c) => c.trim()).filter((_, i) => i > 0) // drop leading empty
  if (cols.length < 7) return null

  const rankStr = cols[0]
  const rank = parseInt(rankStr, 10)
  if (isNaN(rank)) return null

  // Name + URL: [name](url)
  const nameCol = cols[1]
  const nameMatch = nameCol.match(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/)
  if (!nameMatch) return null
  const repoName = nameMatch[1]
  const repoUrl = nameMatch[2]

  // Extract owner/repo from URL
  const urlParts = repoUrl.replace('https://github.com/', '').split('/')
  const owner = urlParts[0] ?? 'unknown'
  const name = urlParts[1] ?? repoName

  const stars = parseInt(cols[2].replace(/,/g, ''), 10) || 0
  const forks = parseInt(cols[3].replace(/,/g, ''), 10) || 0
  const language = cols[4] === 'None' || cols[4] === '' ? null : cols[4]
  const openIssues = parseInt(cols[5].replace(/,/g, ''), 10) || 0

  // description might be very long, truncate for perf
  const description = cols[6]?.slice(0, 280) ?? ''
  const pushedAt = cols[7] ?? ''

  return {
    rank,
    name,
    owner,
    full_name: `${owner}/${name}`,
    html_url: repoUrl,
    stars,
    forks,
    language,
    open_issues: openIssues,
    description,
    pushed_at: pushedAt,
  }
}

export function parseMarkdownFile(filePath: string): RankedRepo[] {
  if (!fs.existsSync(filePath)) return []
  const content = fs.readFileSync(filePath, 'utf-8')
  const lines = content.split('\n')
  const repos: RankedRepo[] = []
  let idx = 0
  for (const line of lines) {
    const trimmed = line.trim()
    // Skip header rows (contain '---' separators or headings)
    if (!trimmed.startsWith('|') || trimmed.includes('---') || trimmed.includes('Ranking')) continue
    const repo = parseRow(trimmed, idx++)
    if (repo) repos.push(repo)
  }
  return repos
}

/** Get all available language categories */
export function getAvailableCategories(): string[] {
  if (!fs.existsSync(TOP100_DIR)) return []
  const files = fs.readdirSync(TOP100_DIR)
  return files
    .filter((f) => f.endsWith('.md') && !f.startsWith('Top-100'))
    .map((f) => f.replace('.md', ''))
    .sort()
}

/** Get top repos for a specific language category or global ranking */
export function getCategoryRepos(category: string): RankedRepo[] {
  let fileName: string
  if (category === 'stars') {
    fileName = 'Top-100-stars.md'
  } else if (category === 'forks') {
    fileName = 'Top-100-forks.md'
  } else {
    fileName = `${category}.md`
  }
  const filePath = path.join(TOP100_DIR, fileName)
  return parseMarkdownFile(filePath)
}

/** Get a summary of all categories with their top 3 repos */
export function getCategorySummary() {
  const categories = getAvailableCategories()
  return categories.map((cat) => {
    const repos = getCategoryRepos(cat)
    return {
      category: cat,
      count: repos.length,
      top3: repos.slice(0, 3).map((r) => ({
        name: r.name,
        stars: r.stars,
        description: r.description?.slice(0, 80),
      })),
    }
  })
}

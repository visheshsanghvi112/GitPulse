import axios from 'axios'

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || process.env.GITHUB_PAT

const client = axios.create({
  baseURL: 'https://api.github.com',
  headers: GITHUB_TOKEN ? { Authorization: `bearer ${GITHUB_TOKEN}` } : undefined,
  timeout: 30000
})

async function getGraphQLData(query: string) {
  // robust retry with exponential backoff similar to original project
  const graphqlApi = '/graphql'
  const maxAttempts = 5
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const resp = await client.post(graphqlApi, { query })
      if (resp.status === 200) return resp.data
      // handle rate limit
      if (resp.status === 403) {
        const err: any = new Error('GitHub rate limit or permission error')
        ;(err as any).status = 403
        throw err
      }
      console.warn(`GitHub GraphQL unexpected status ${resp.status}`)
    } catch (e: any) {
      if (attempt === maxAttempts) throw e
      const wait = 2000 * attempt
      await new Promise((r) => setTimeout(r, wait))
    }
  }
}

function parseGQLResult(result: any) {
  const items: any[] = []
  const edges = result?.data?.search?.edges || []
  for (const edge of edges) {
    const repo = edge.node
    items.push({
      name: repo.name,
      stargazers_count: repo.stargazerCount,
      forks_count: repo.forkCount,
      language: repo.primaryLanguage ? repo.primaryLanguage.name : null,
      html_url: repo.url,
      owner: { login: repo.owner.login, avatar_url: undefined },
      open_issues_count: repo.openIssues?.totalCount ?? 0,
      pushed_at: repo.pushedAt,
      description: repo.description
    })
  }
  return items
}

export async function fetchReposByGraphQL(queryStr: string, perPage = 50, pages = 2) {
  const gqlTemplate = (q: string, first: number, after?: string) => `query{\n  search(query: \"${q}\", type: REPOSITORY, first:${first} ${after ?? ''}) {\n    pageInfo { endCursor }\n    edges {\n      node {\n        ...on Repository {\n          id\n          name\n          url\n          forkCount\n          stargazerCount\n          owner { login }\n          description\n          pushedAt\n          primaryLanguage { name }\n          openIssues: issues(states: OPEN) { totalCount }\n        }\n      }\n    }\n  }\n}`

  let cursor = ''
  const repos: any[] = []
  for (let i = 0; i < pages; i++) {
    const q = gqlTemplate(queryStr, perPage, cursor)
    const data = await getGraphQLData(q)
    const parsed = parseGQLResult(data)
    repos.push(...parsed)
    const endCursor = data?.data?.search?.pageInfo?.endCursor
    if (!endCursor) break
    cursor = `, after:\"${endCursor}\"`
  }
  return repos
}

export async function fetchTopStars(perPage = 50, pages = 2) {
  return fetchReposByGraphQL('stars:>1000 sort:stars', perPage, pages)
}

export async function fetchTopForks(perPage = 50, pages = 2) {
  return fetchReposByGraphQL('forks:>1000 sort:forks', perPage, pages)
}

export async function fetchTopByLanguage(language: string, perPage = 50, pages = 2) {
  return fetchReposByGraphQL(`language:${language} stars:>0 sort:stars`, perPage, pages)
}

export default {
  fetchTopStars,
  fetchTopForks,
  fetchTopByLanguage,
  fetchReposByGraphQL
}

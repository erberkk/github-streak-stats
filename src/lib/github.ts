export interface ContributionDay {
  date: string
  count: number
}

export interface GitHubUser {
  login: string
  name: string | null
  avatar_url: string
  created_at: string
}

export interface StreakRange {
  length: number
  start: string | null
  end: string | null
}

export interface GitHubStats {
  user: GitHubUser
  totalContributions: number
  activeDays: number
  currentStreak: StreakRange
  longestStreak: StreakRange
  contributedToday: boolean
  days: ContributionDay[]
  source: 'graphql' | 'html'
  generatedAt: string
}

const USERNAME_RE = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i
const CACHE_TTL_MS = 10 * 60 * 1000
const REQUEST_TIMEOUT_MS = 6000

export function isValidUsername(username: string): boolean {
  return USERNAME_RE.test(username)
}

export class UserNotFoundError extends Error {}

const cache = new Map<string, { expires: number; value: Promise<GitHubStats> }>()

// Cached per warm instance; concurrent requests for the same user share one fetch.
export function getStats(username: string): Promise<GitHubStats> {
  const key = username.toLowerCase()
  const hit = cache.get(key)
  if (hit && hit.expires > Date.now()) return hit.value

  const value = computeStats(username)
  cache.set(key, { expires: Date.now() + CACHE_TTL_MS, value })
  value.catch(() => cache.delete(key))
  return value
}

function headers(extra: Record<string, string> = {}): Record<string, string> {
  const h: Record<string, string> = { 'User-Agent': 'github-streak-stats', ...extra }
  if (process.env.GITHUB_TOKEN) h.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`
  return h
}

async function fetchWithTimeout(url: string, init: RequestInit = {}): Promise<Response> {
  return fetch(url, { ...init, cache: 'no-store', signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) })
}

async function fetchUser(username: string): Promise<GitHubUser> {
  const res = await fetchWithTimeout(`https://api.github.com/users/${username}`, {
    headers: headers({ Accept: 'application/vnd.github+json' }),
  })
  if (res.status === 404) throw new UserNotFoundError(`User ${username} not found`)
  if (!res.ok) throw new Error(`Failed to fetch user: ${res.status}`)
  const data = await res.json()
  return { login: data.login, name: data.name, avatar_url: data.avatar_url, created_at: data.created_at }
}

function yearRange(createdAt: string): number[] {
  const first = new Date(createdAt).getUTCFullYear()
  const last = new Date().getUTCFullYear()
  const years: number[] = []
  for (let y = first; y <= last; y++) years.push(y)
  return years
}

// All years in a single GraphQL request (one aliased contributionsCollection per year).
async function fetchDaysGraphQL(username: string, years: number[]): Promise<ContributionDay[]> {
  if (!process.env.GITHUB_TOKEN) throw new Error('GITHUB_TOKEN not set')

  const fields = years
    .map(
      (y) => `y${y}: contributionsCollection(from: "${y}-01-01T00:00:00Z", to: "${y}-12-31T23:59:59Z") {
        contributionCalendar { weeks { contributionDays { date contributionCount } } }
      }`
    )
    .join('\n')
  const query = `query($login: String!) { user(login: $login) { ${fields} } }`

  const res = await fetchWithTimeout('https://api.github.com/graphql', {
    method: 'POST',
    headers: headers({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ query, variables: { login: username } }),
  })
  if (!res.ok) throw new Error(`GraphQL request failed: ${res.status}`)
  const json = await res.json()
  const user = json.data?.user
  if (!user) throw new Error(`GraphQL returned no user: ${JSON.stringify(json.errors ?? null)}`)

  const days: ContributionDay[] = []
  for (const y of years) {
    for (const week of user[`y${y}`]?.contributionCalendar?.weeks ?? []) {
      for (const d of week.contributionDays) days.push({ date: d.date, count: d.contributionCount })
    }
  }
  return days
}

// Token-less fallback: parse the public contribution calendar HTML, one request per year in parallel.
async function fetchDaysHtml(username: string, years: number[]): Promise<ContributionDay[]> {
  const pages = await Promise.all(
    years.map(async (y) => {
      const res = await fetchWithTimeout(
        `https://github.com/users/${username}/contributions?from=${y}-01-01&to=${y}-12-31`,
        { headers: headers() }
      )
      if (!res.ok) throw new Error(`Failed to fetch contributions page: ${res.status}`)
      return res.text()
    })
  )

  const days: ContributionDay[] = []
  for (const html of pages) {
    const counts = new Map<string, number>()
    for (const m of html.matchAll(/<tool-tip[^>]*for="([^"]+)"[^>]*>([^<]*)<\/tool-tip>/g)) {
      const n = m[2].match(/^([\d,]+) contribution/)
      counts.set(m[1], n ? parseInt(n[1].replace(/,/g, ''), 10) : 0)
    }
    for (const m of html.matchAll(/<td[^>]*data-date="(\d{4}-\d{2}-\d{2})"[^>]*>/g)) {
      const id = m[0].match(/id="([^"]+)"/)?.[1]
      days.push({ date: m[1], count: (id && counts.get(id)) || 0 })
    }
  }
  return days
}

function dayDiff(a: string, b: string): number {
  return Math.round((Date.parse(a + 'T00:00:00Z') - Date.parse(b + 'T00:00:00Z')) / 86400000)
}

function computeStreaks(active: string[], today: string) {
  let longest: StreakRange = { length: 0, start: null, end: null }
  let runStart = active[0]
  let runLength = 0

  for (let i = 0; i < active.length; i++) {
    if (i > 0 && dayDiff(active[i], active[i - 1]) === 1) {
      runLength++
    } else {
      runStart = active[i]
      runLength = 1
    }
    if (runLength > longest.length) longest = { length: runLength, start: runStart, end: active[i] }
  }

  const last = active[active.length - 1]
  // A streak stays alive until the end of the day after the last contribution.
  const current: StreakRange =
    last && dayDiff(today, last) <= 1
      ? { length: runLength, start: runStart, end: last }
      : { length: 0, start: null, end: null }

  return { current, longest }
}

async function computeStats(username: string): Promise<GitHubStats> {
  const user = await fetchUser(username)
  const years = yearRange(user.created_at)

  let source: GitHubStats['source'] = 'graphql'
  let days: ContributionDay[]
  try {
    days = await fetchDaysGraphQL(user.login, years)
  } catch {
    source = 'html'
    days = await fetchDaysHtml(user.login, years)
  }

  const today = new Date().toISOString().slice(0, 10)
  const byDate = new Map<string, number>()
  for (const d of days) {
    if (d.date <= today) byDate.set(d.date, Math.max(byDate.get(d.date) ?? 0, d.count))
  }
  const sorted = Array.from(byDate, ([date, count]) => ({ date, count })).sort((a, b) =>
    a.date.localeCompare(b.date)
  )
  const active = sorted.filter((d) => d.count > 0).map((d) => d.date)
  const { current, longest } = computeStreaks(active, today)

  return {
    user,
    totalContributions: sorted.reduce((sum, d) => sum + d.count, 0),
    activeDays: active.length,
    currentStreak: current,
    longestStreak: longest,
    contributedToday: active[active.length - 1] === today,
    days: sorted,
    source,
    generatedAt: new Date().toISOString(),
  }
}

import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0


interface GitHubUser {
  login: string
  id: number
  avatar_url: string
  name: string
  company: string
  location: string
  email: string
  bio: string
  public_repos: number
  followers: number
  following: number
  created_at: string
}

interface ContributionDay {
  date: string
  count: number
}

interface ContributionData {
  totalContributions: number
  weeks: ContributionWeek[]
}

interface ContributionWeek {
  contributionDays: ContributionDay[]
}

interface ContributionsWithUser {
  user: GitHubUser
  contributions: ContributionData
}

interface GitHubStats {
  user: GitHubUser
  contributions: ContributionData
  streak: {
    current: number
    longest: number
    total: number
  }
  _metadata?: {
    includesPrivateRepos: boolean
    dataSource: string
    note: string
  }
}

async function fetchGitHubUser(username: string): Promise<GitHubUser> {
  const response = await fetch(`https://api.github.com/users/${username}`, { cache: 'no-store' })
  if (!response.ok) {
    throw new Error(`Failed to fetch user: ${response.status}`)
  }
  return response.json()
}

async function fetchContributions(username: string): Promise<ContributionsWithUser> {
  try {
    // First get user's account creation year
    const userResponse = await fetch(`https://api.github.com/users/${username}`, { cache: 'no-store' })
    if (!userResponse.ok) {
      throw new Error(`Failed to fetch user: ${userResponse.status}`)
    }
    const userData = await userResponse.json()
    const accountCreationYear = new Date(userData.created_at).getFullYear()



    // Get ALL years of contributions data from account creation to current year
    const currentYear = new Date().getUTCFullYear()
    const allContributions: ContributionDay[] = []
    let totalContributions = 0

    // Get data for each year from account creation to current year
    for (let year = accountCreationYear; year <= currentYear; year++) {


      const fromDate = new Date(Date.UTC(year, 0, 1)) // January 1st of the year (UTC)
      const toDate = new Date(Date.UTC(year, 11, 31, 23, 59, 59)) // December 31st of the year (UTC)

      const query = `
        query($username: String!, $from: DateTime!, $to: DateTime!) {
          user(login: $username) {
            contributionsCollection(from: $from, to: $to) {
              contributionCalendar {
                totalContributions
                weeks {
                  contributionDays {
                    date
                    contributionCount
                  }
                }
              }
            }
          }
        }
      `

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'User-Agent': 'GitHub-Streak-Widget/1.0'
      }

      if (process.env.GITHUB_TOKEN) {
        headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`
      }

      const response = await fetch('https://api.github.com/graphql', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          query,
          variables: {
            username,
            from: fromDate.toISOString(),
            to: toDate.toISOString()
          }
        }),
        cache: 'no-store'
      })

      if (response.ok) {
        const data = await response.json()

        if (data.data?.user?.contributionsCollection?.contributionCalendar) {
          const calendar = data.data.user.contributionsCollection.contributionCalendar
          totalContributions += calendar.totalContributions

          // Add all contribution days from this year
          calendar.weeks.forEach((week: any) => {
            week.contributionDays.forEach((day: any) => {
              allContributions.push({
                date: day.date,
                count: day.contributionCount
              })
            })
          })


        }
      } else {

      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100))
    }



    // Sort contributions by date
    allContributions.sort((a, b) => a.date.localeCompare(b.date))

    return {
      user: userData,
      contributions: {
        totalContributions,
        weeks: [{
          contributionDays: allContributions
        }]
      }
    }

  } catch (error) {

    const fallbackContributions = await fetchContributionsFromHtml(username)
    const fallbackUser = await fetchGitHubUser(username)

    return {
      user: fallbackUser,
      contributions: fallbackContributions
    }
  }
}

async function fetchContributionsFromHtml(username: string): Promise<ContributionData> {
  try {
    // Try Events API first (most accurate for recent activity)
    const eventsData = await fetchFromEventsAPI(username)
    if (eventsData.totalContributions > 0) {
      return eventsData
    }
  } catch (error) {

  }

  try {
    // Try GraphQL API
    const graphqlData = await fetchFromGraphQL(username)
    if (graphqlData.totalContributions > 0) {
      return graphqlData
    }
  } catch (error) {

  }

  // Final fallback to HTML parsing
  return await fetchFromContributionsPage(username)
}

async function fetchFromEventsAPI(username: string): Promise<ContributionData> {
  const eventsHeaders: Record<string, string> = {
    'User-Agent': 'GitHub-Streak-Widget/1.0'
  }

  if (process.env.GITHUB_TOKEN) {
    eventsHeaders['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`
  }

  // Get multiple pages of events to get more data
  const allEvents: any[] = []
  const maxPages = 5 // Get last 500 events

  for (let page = 1; page <= maxPages; page++) {
    const eventsResponse = await fetch(`https://api.github.com/users/${username}/events?per_page=100&page=${page}`, {
      headers: eventsHeaders,
      cache: 'no-store'
    })

    if (!eventsResponse.ok) {
      break
    }

    const events = await eventsResponse.json()
    if (events.length === 0) {
      break
    }

    allEvents.push(...events)
  }



  // Group events by date and count contributions
  const contributionsMap = new Map<string, number>()

  allEvents.forEach((event: any) => {
    if (event.type === 'PushEvent' || event.type === 'PullRequestEvent' || event.type === 'IssuesEvent') {
      const date = event.created_at.split('T')[0]
      contributionsMap.set(date, (contributionsMap.get(date) || 0) + 1)
    }
  })

  const contributions: ContributionDay[] = Array.from(contributionsMap.entries())
    .map(([date, count]) => ({
      date,
      count
    }))
    .sort((a, b) => a.date.localeCompare(b.date))



  return {
    totalContributions: contributions.reduce((sum, day) => sum + day.count, 0),
    weeks: [{
      contributionDays: contributions
    }]
  }
}

async function fetchFromGraphQL(username: string): Promise<ContributionData> {
  const query = `
      query($username: String!) {
        user(login: $username) {
          contributionsCollection {
            contributionCalendar {
              totalContributions
              weeks {
                contributionDays {
                  date
                  contributionCount
                }
              }
            }
          }
        }
      }
    `

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'User-Agent': 'GitHub-Streak-Widget/1.0'
  }

  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`
  }

  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      query,
      variables: { username }
    }),
    cache: 'no-store'
  })

  if (response.ok) {
    const data = await response.json()

    if (data.data?.user?.contributionsCollection?.contributionCalendar) {
      const calendar = data.data.user.contributionsCollection.contributionCalendar

      return {
        totalContributions: calendar.totalContributions,
        weeks: calendar.weeks.map((week: any) => ({
          contributionDays: week.contributionDays.map((day: any) => ({
            date: day.date,
            count: day.contributionCount
          }))
        }))
      }
    }
  }

  throw new Error('GraphQL query failed')
}

async function fetchFromContributionsPage(username: string): Promise<ContributionData> {
  const response = await fetch(`https://github.com/users/${username}/contributions`, {
    headers: {
      'User-Agent': 'GitHub-Streak-Widget/1.0'
    },
    cache: 'no-store'
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch contributions: ${response.status}`)
  }

  const data = await response.text()

  // Parse the SVG response to extract contribution data
  const contributionRegex = /data-date="([^"]+)" data-count="([^"]+)"/g
  const contributions: ContributionDay[] = []
  let match

  while ((match = contributionRegex.exec(data)) !== null) {
    contributions.push({
      date: match[1],
      count: parseInt(match[2], 10)
    })
  }



  return {
    totalContributions: contributions.reduce((sum, day) => sum + day.count, 0),
    weeks: [{
      contributionDays: contributions
    }]
  }
}

function toUtcMidnight(dateString: string): Date {
  return new Date(dateString + 'T00:00:00Z')
}

function daysDiffUtc(a: string, b: string): number {
  const dateA = toUtcMidnight(a)
  const dateB = toUtcMidnight(b)
  return Math.floor((dateA.getTime() - dateB.getTime()) / (1000 * 60 * 60 * 24))
}

function calculateCurrentStreak(contributions: ContributionDay[]): number {
  const sortedContributions = contributions
    .filter(day => day.count > 0)
    .sort((a, b) => b.date.localeCompare(a.date))

  if (sortedContributions.length === 0) return 0

  // Get today's date in UTC (GitHub uses UTC for dates)
  const now = new Date()
  const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  const todayString = todayUTC.toISOString().slice(0, 10)

  const mostRecentContribution = sortedContributions[0]
  const mostRecentDate = mostRecentContribution.date

  // Calculate days difference between today and most recent contribution
  const daysDiff = daysDiffUtc(todayString, mostRecentDate)

  // If the most recent contribution is more than 1 day ago, streak is broken
  if (daysDiff > 1) {
    return 0
  }

  // Create a set of all contribution dates for quick lookup
  const contributionDates = new Set(sortedContributions.map(day => day.date))

  // Start counting from the most recent contribution date
  let streak = 1
  let checkDate = toUtcMidnight(mostRecentDate)
  checkDate.setUTCDate(checkDate.getUTCDate() - 1)

  // Count backwards checking for consecutive days
  // We continue as long as we find contributions on consecutive days
  while (true) {
    const checkDateString = checkDate.toISOString().slice(0, 10)
    
    if (contributionDates.has(checkDateString)) {
      streak++
      checkDate.setUTCDate(checkDate.getUTCDate() - 1)
    } else {
      // Gap found - streak is broken
      break
    }
  }

  return streak
}

function calculateLongestStreak(contributions: ContributionDay[]): number {
  const sortedContributions = contributions
    .filter(day => day.count > 0)
    .sort((a, b) => a.date.localeCompare(b.date))

  if (sortedContributions.length === 0) return 0

  let longestStreak = 0
  let currentStreak = 1

  for (let i = 1; i < sortedContributions.length; i++) {
    const dayDiff = daysDiffUtc(sortedContributions[i].date, sortedContributions[i - 1].date)

    if (dayDiff === 1) {
      currentStreak++
    } else {
      longestStreak = Math.max(longestStreak, currentStreak)
      currentStreak = 1
    }
  }

  return Math.max(longestStreak, currentStreak)
}

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const { username } = params

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      )
    }

    // Fetch both user and contributions data in one call
    const dataWithUser = await fetchContributions(username)
    const { user, contributions } = dataWithUser

    // Calculate streaks from ALL contribution days
    const allContributionDays = contributions.weeks[0].contributionDays
    
    // Calculate total contributions from actual contribution days (more accurate than summing API totals)
    const totalContributions = allContributionDays.reduce((sum, day) => sum + (day.count || 0), 0)
    
    // Update contributions object with calculated total
    contributions.totalContributions = totalContributions
    
    const currentStreak = calculateCurrentStreak(allContributionDays)
    const longestStreak = calculateLongestStreak(allContributionDays)
    const totalDays = allContributionDays.filter(day => day.count > 0).length

    // Add info about private repos
    const hasToken = !!process.env.GITHUB_TOKEN

    const stats: GitHubStats = {
      user,
      contributions,
      streak: {
        current: currentStreak,
        longest: longestStreak,
        total: totalDays
      }
    }

    // Add metadata about data source
    const enhancedStats = {
      ...stats,
      _metadata: {
        includesPrivateRepos: hasToken,
        dataSource: hasToken ? 'Authenticated API' : 'Public API only',
        note: hasToken
          ? 'Includes private repositories and organization contributions'
          : 'Only public contributions shown. Add GITHUB_TOKEN for private repos.'
      }
    }

    return NextResponse.json(enhancedStats)
  } catch (error) {
    console.error('Error fetching GitHub data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch GitHub data' },
      { status: 500 }
    )
  }
}
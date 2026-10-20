import { NextRequest, NextResponse } from 'next/server'
import { getStats, isValidUsername, UserNotFoundError } from '@/lib/github'

export const dynamic = 'force-dynamic'
export const maxDuration = 10

export async function GET(_request: NextRequest, { params }: { params: { username: string } }) {
  const { username } = params

  if (!isValidUsername(username)) {
    return NextResponse.json({ error: 'Invalid GitHub username' }, { status: 400 })
  }

  try {
    const { days, ...stats } = await getStats(username)
    return NextResponse.json(
      { ...stats, recentDays: days.slice(-30) },
      { headers: { 'Cache-Control': 'public, max-age=0, s-maxage=600, stale-while-revalidate=86400' } }
    )
  } catch (error) {
    if (error instanceof UserNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }
    console.error('Error fetching GitHub data:', error)
    return NextResponse.json({ error: 'Failed to fetch GitHub data' }, { status: 502 })
  }
}

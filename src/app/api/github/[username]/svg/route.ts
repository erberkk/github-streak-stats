import { NextRequest, NextResponse } from 'next/server'
import { getStats, isValidUsername, UserNotFoundError } from '@/lib/github'
import { parseTheme, renderCard, renderErrorCard } from '@/lib/card'

export const dynamic = 'force-dynamic'
export const maxDuration = 10

// GitHub's image proxy (camo) gives up after a few seconds, so the card must be
// served from the CDN whenever possible. Stale copies are served instantly while
// a fresh one is generated in the background.
const CACHE_OK = 'public, max-age=0, s-maxage=600, stale-while-revalidate=86400'
const CACHE_ERROR = 'public, max-age=0, s-maxage=60'

function svgResponse(body: string, cacheControl: string) {
  // Always 200: camo shows a broken image for error statuses.
  return new NextResponse(body, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': cacheControl,
    },
  })
}

export async function GET(request: NextRequest, { params }: { params: { username: string } }) {
  const theme = parseTheme(request.nextUrl.searchParams.get('theme'))
  const { username } = params

  if (!isValidUsername(username)) {
    return svgResponse(renderErrorCard('Invalid GitHub username', theme), CACHE_ERROR)
  }

  try {
    const stats = await getStats(username)
    return svgResponse(renderCard(stats, theme), CACHE_OK)
  } catch (error) {
    console.error('Error generating SVG:', error)
    const message =
      error instanceof UserNotFoundError ? `User @${username} not found` : 'Could not load stats, try again shortly'
    return svgResponse(renderErrorCard(message, theme), CACHE_ERROR)
  }
}

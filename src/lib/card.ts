import type { GitHubStats, StreakRange } from './github'

export type Theme = 'auto' | 'dark' | 'light'

export function parseTheme(value: string | null): Theme {
  return value === 'dark' || value === 'light' ? value : 'auto'
}

const WIDTH = 800
const HEIGHT = 256
const PAD = 24
const FONT = `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif`

const PALETTES = {
  dark: {
    bg: '#0d1117',
    border: '#30363d',
    text: '#e6edf3',
    muted: '#8b949e',
    track: '#21262d',
    accentFrom: '#ffb347',
    accentTo: '#ff5f2e',
    accent: '#ff8a3d',
    ok: '#3fb950',
    warn: '#d29922',
  },
  light: {
    bg: '#ffffff',
    border: '#d0d7de',
    text: '#1f2328',
    muted: '#656d76',
    track: '#eaeef2',
    accentFrom: '#ff9a3c',
    accentTo: '#e8470f',
    accent: '#e8590c',
    ok: '#1a7f37',
    warn: '#9a6700',
  },
}

function vars(p: (typeof PALETTES)['dark']): string {
  return Object.entries(p)
    .map(([k, v]) => `--${k}:${v};`)
    .join('')
}

function themeCss(theme: Theme): string {
  if (theme !== 'auto') return `svg{${vars(PALETTES[theme])}}`
  return `svg{${vars(PALETTES.light)}}@media (prefers-color-scheme: dark){svg{${vars(PALETTES.dark)}}}`
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function formatDate(iso: string, withYear = true): string {
  const d = new Date(iso.slice(0, 10) + 'T00:00:00Z')
  const base = `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`
  return withYear ? `${base}, ${d.getUTCFullYear()}` : base
}

function formatRange(range: StreakRange): string {
  if (!range.start || !range.end) return 'No active streak'
  if (range.start === range.end) return formatDate(range.start)
  const sameYear = range.start.slice(0, 4) === range.end.slice(0, 4)
  return `${formatDate(range.start, !sameYear)} – ${formatDate(range.end)}`
}

function formatNumber(n: number): string {
  return n.toLocaleString('en-US')
}

function escapeXml(s: string): string {
  return s.replace(/[<>&'"]/g, (c) => `&#${c.charCodeAt(0)};`)
}

function status(stats: GitHubStats): { text: string; color: string } {
  if (stats.contributedToday) return { text: 'Active today', color: 'var(--ok)' }
  if (stats.currentStreak.length > 0) return { text: 'Contribute today to keep it', color: 'var(--warn)' }
  return { text: 'Start a new streak', color: 'var(--muted)' }
}

function statColumn(cx: number, value: string, label: string, sub: string, delay: number): string {
  return `<g class="fade" style="animation-delay:${delay}ms">
    <text x="${cx}" y="124" text-anchor="middle" class="value">${value}</text>
    <text x="${cx}" y="164" text-anchor="middle" class="label">${label}</text>
    <text x="${cx}" y="182" text-anchor="middle" class="sub">${sub}</text>
  </g>`
}

function streakRing(cx: number, stats: GitHubStats): string {
  const r = 32
  const cy = 110
  const circumference = 2 * Math.PI * r
  const { length: current } = stats.currentStreak
  const best = Math.max(stats.longestStreak.length, 1)
  const progress = current === 0 ? 0 : Math.max(0.04, Math.min(current / best, 1))
  const offset = circumference * (1 - progress)
  // Lucide "flame" icon, scaled to 16px.
  const flame =
    'M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z'

  return `<g class="fade" style="animation-delay:120ms">
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="var(--track)" stroke-width="6"/>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="url(#accent)" stroke-width="6" stroke-linecap="round"
      stroke-dasharray="${circumference.toFixed(2)}" stroke-dashoffset="${offset.toFixed(2)}"
      transform="rotate(-90 ${cx} ${cy})" class="ring" style="--from:${circumference.toFixed(2)};--to:${offset.toFixed(2)}"/>
    <circle cx="${cx}" cy="${cy - r}" r="12" fill="var(--bg)"/>
    <g transform="translate(${cx - 8} ${cy - r - 8}) scale(0.6667)" class="flame">
      <path d="${flame}" fill="url(#accent)" stroke="url(#accent)" stroke-width="2" stroke-linejoin="round"/>
    </g>
    <text x="${cx}" y="${cy + 9}" text-anchor="middle" class="ring-value">${formatNumber(current)}</text>
    <text x="${cx}" y="164" text-anchor="middle" class="label accent">Current Streak</text>
    <text x="${cx}" y="182" text-anchor="middle" class="sub">${formatRange(stats.currentStreak)}</text>
  </g>`
}

function recentBars(stats: GitHubStats, x0: number, x1: number, y: number, h: number): string {
  const n = 30
  const byDate = new Map(stats.days.map((d) => [d.date, d.count]))
  const today = new Date()
  const counts: number[] = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - i))
    counts.push(byDate.get(d.toISOString().slice(0, 10)) ?? 0)
  }
  const max = Math.max(...counts, 1)
  const slot = (x1 - x0) / n
  const barW = Math.max(slot - 5, 2)

  return counts
    .map((c, i) => {
      const bh = c === 0 ? 3 : Math.max(5, (c / max) * h)
      const bx = x0 + i * slot + (slot - barW) / 2
      const fill = c === 0 ? 'var(--track)' : 'url(#accent-v)'
      const opacity = c === 0 ? 1 : (0.45 + 0.55 * (c / max)).toFixed(2)
      return `<rect x="${bx.toFixed(1)}" y="${(y + h - bh).toFixed(1)}" width="${barW.toFixed(1)}" height="${bh.toFixed(1)}" rx="1.5" fill="${fill}" opacity="${opacity}" class="bar" style="animation-delay:${300 + i * 12}ms"><title>${c} contribution${c === 1 ? '' : 's'}</title></rect>`
    })
    .join('')
}

export function renderCard(stats: GitHubStats, theme: Theme): string {
  const colW = (WIDTH - PAD * 2) / 3
  const centers = [PAD + colW / 2, PAD + colW * 1.5, PAD + colW * 2.5]
  const login = escapeXml(stats.user.login)
  const st = status(stats)
  const pillW = st.text.length * 6.6 + 34
  const pillX = WIDTH - PAD - pillW

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" role="img" aria-label="${login}'s GitHub streak: ${stats.currentStreak.length} day current streak, ${stats.longestStreak.length} day longest streak, ${stats.totalContributions} total contributions">
  <title>${login}'s GitHub contribution streak</title>
  <style>
    ${themeCss(theme)}
    text{font-family:${FONT};fill:var(--text)}
    .title{font-size:16px;font-weight:600}
    .title .dim{fill:var(--muted);font-weight:400}
    .value{font-size:30px;font-weight:700;letter-spacing:-0.5px}
    .ring-value{font-size:24px;font-weight:700;letter-spacing:-0.5px}
    .label{font-size:13px;font-weight:600}
    .accent{fill:var(--accent)}
    .sub,.caption{font-size:11.5px;fill:var(--muted)}
    .pill{font-size:11.5px;font-weight:500;fill:var(--muted)}
    .fade{animation:fade .6s ease-out both}
    .ring{animation:draw 1.1s cubic-bezier(.3,.7,.3,1) .2s both}
    .bar{transform-box:fill-box;transform-origin:bottom;animation:grow .5s ease-out both}
    .flame{transform-box:fill-box;transform-origin:center bottom}
    .flame path{animation:flicker 2.4s ease-in-out infinite;transform-box:fill-box;transform-origin:center bottom}
    @keyframes fade{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
    @keyframes draw{from{stroke-dashoffset:var(--from)}to{stroke-dashoffset:var(--to)}}
    @keyframes grow{from{transform:scaleY(0)}to{transform:scaleY(1)}}
    @keyframes flicker{0%,100%{transform:scale(1)}50%{transform:scale(1.06,0.96)}}
    @media (prefers-reduced-motion: reduce){*{animation:none!important}}
  </style>
  <defs>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" style="stop-color:var(--accentFrom)"/>
      <stop offset="1" style="stop-color:var(--accentTo)"/>
    </linearGradient>
    <linearGradient id="accent-v" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0" style="stop-color:var(--accentTo)"/>
      <stop offset="1" style="stop-color:var(--accentFrom)"/>
    </linearGradient>
  </defs>

  <rect x="0.5" y="0.5" width="${WIDTH - 1}" height="${HEIGHT - 1}" rx="12" style="fill:var(--bg);stroke:var(--border)"/>

  <g class="fade">
    <text x="${PAD}" y="37" class="title">@${login}<tspan class="dim"> · contribution streak</tspan></text>
    <rect x="${pillX.toFixed(1)}" y="18" width="${pillW.toFixed(1)}" height="26" rx="13" style="fill:none;stroke:var(--border)"/>
    <circle cx="${(pillX + 15).toFixed(1)}" cy="31" r="4" style="fill:${st.color}"/>
    <text x="${(pillX + 25).toFixed(1)}" y="35" class="pill">${st.text}</text>
  </g>
  <line x1="${PAD}" y1="58" x2="${WIDTH - PAD}" y2="58" style="stroke:var(--border)"/>

  <line x1="${PAD + colW}" y1="84" x2="${PAD + colW}" y2="180" style="stroke:var(--border)"/>
  <line x1="${PAD + colW * 2}" y1="84" x2="${PAD + colW * 2}" y2="180" style="stroke:var(--border)"/>

  ${statColumn(
    centers[0],
    formatNumber(stats.totalContributions),
    'Total Contributions',
    `${formatDate(stats.user.created_at)} – Present`,
    60
  )}
  ${streakRing(centers[1], stats)}
  ${statColumn(
    centers[2],
    formatNumber(stats.longestStreak.length),
    'Longest Streak',
    formatRange(stats.longestStreak),
    180
  )}

  <line x1="${PAD}" y1="200" x2="${WIDTH - PAD}" y2="200" style="stroke:var(--border)"/>
  <text x="${PAD}" y="232" class="caption">Last 30 days</text>
  ${recentBars(stats, 116, WIDTH - PAD - 140, 212, 26)}
  <text x="${WIDTH - PAD}" y="232" text-anchor="end" class="caption">${formatNumber(stats.activeDays)} active days total</text>
</svg>`
}

export function renderErrorCard(message: string, theme: Theme): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" role="img" aria-label="${escapeXml(message)}">
  <style>
    ${themeCss(theme)}
    text{font-family:${FONT}}
  </style>
  <rect x="0.5" y="0.5" width="${WIDTH - 1}" height="${HEIGHT - 1}" rx="12" style="fill:var(--bg);stroke:var(--border)"/>
  <text x="${WIDTH / 2}" y="${HEIGHT / 2 - 4}" text-anchor="middle" style="fill:var(--text);font-size:16px;font-weight:600">GitHub streak stats</text>
  <text x="${WIDTH / 2}" y="${HEIGHT / 2 + 20}" text-anchor="middle" style="fill:var(--muted);font-size:13px">${escapeXml(message)}</text>
</svg>`
}

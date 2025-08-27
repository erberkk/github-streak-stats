import { NextRequest, NextResponse } from 'next/server'

// GitHub renk paleti - mevcut component'tekiyle aynı
const COLORS = {
  background: '#0d1117',
  cardBackground: '#161b22',
  cardBorder: '#30363d',
  accent: '#58a6ff',
  textPrimary: '#c9d1d9',
  textSecondary: '#8b949e',
  stats: {
    contributions: '#60a5fa',
    currentStreak: '#f87171',
    longestStreak: '#fbbf24',
    activeDays: '#34d399'
  }
}

interface GitHubStats {
  user: {
    login: string
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
  contributions: {
    totalContributions: number
    weeks: any[]
  }
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

// SVG ikonları - mevcut component'teki Lucide ikonlarının SVG versiyonları
const ICONS = {
  trendingUp: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M23 6L13.5 15.5L8.5 10.5L0 19L3 22L8.5 16.5L13.5 21.5L26 9L23 6Z" fill="url(#trendingGradient)"/>
  </svg>`,
  flame: `<svg width="25" height="25" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 3 10 7 15 4-5 7-9.75 7-15 0-3.87-3.13-7-7-7zm0 10c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" fill="url(#flameGradient)"/>
  </svg>`,
  star: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="url(#starGradient)"/>
  </svg>`,
  calendar: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" fill="none" stroke="url(#calendarGradient)" stroke-width="2"/>
    <line x1="16" y1="2" x2="16" y2="6" stroke="url(#calendarGradient)" stroke-width="2"/>
    <line x1="8" y1="2" x2="8" y2="6" stroke="url(#calendarGradient)" stroke-width="2"/>
    <line x1="3" y1="10" x2="21" y2="10" stroke="url(#calendarGradient)" stroke-width="2"/>
  </svg>`
}

function formatNumber(num: number, isTotalContributions: boolean = false): string {
  // Total Contributions için tam değer göster, diğerleri için yuvarla
  if (isTotalContributions) {
    return num.toString()
  }

  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

function createSVGCard(x: number, y: number, width: number, height: number, stat: any, index: number): string {
  const iconName = stat.icon
  const progress = stat.progress || 0

  // Kart yüksekliği 175px, progress bar yüksekliği 90px
  // Progress bar'ı yukarı çek, ikon ve değerleri ona göre konumlandır
  const progressBarX = x + 35 // 170px width'li container'ı kart içinde ortalamak için (240px - 170px) / 2 = 35px
  const progressBarY = y + 25 // Kart içinde yukarıda konumlandır (25px margin)

  // İkon ve değer konteyneri - progress bar'ın alt kısmında konumlandır
  // Progress bar yüksekliği 90px, ikonları alt kısımda konumlandır
  const iconX = progressBarX + 85 - 24 - 8 // İkon biraz sola çekildi (8px sola)
  const iconY = progressBarY + 40 // İkonları biraz daha yukarıya çek (40px pozisyon)
  const valueX = progressBarX + 85 + 12 - 8 // İkon merkezinden 12px sağa, 8px sola çekildi
  const valueY = progressBarY + 52 + 7 // Sayısal verileri biraz yukarıya çek (5px yukarı)

  // Label pozisyonu - progress bar'ın altında, mt: 0.15 ≈ 2px
  const labelY = progressBarY + 90 + 2

  return `
    <g transform="translate(${x}, ${y})">
      <!-- Kart arka planı - mevcut component'teki detaylı background efekti -->
      <rect x="0" y="0" width="${width}" height="${height}" rx="16" ry="16"
            fill="url(#cardMainBg-${index})" stroke="${stat.borderColor}" stroke-width="1"
            filter="url(#cardShadow-${index})"/>

      <!-- Kart iç glow efekti - orta kısım parlaklığını azaltılmış -->
      <rect x="0" y="0" width="${width}" height="${height}" rx="16" ry="16"
            fill="url(#cardInnerGlow-${index})" opacity="0.6"/>
      <rect x="0" y="0" width="${width}" height="${height}" rx="16" ry="16"
            fill="url(#cardInnerGlow-${index}-overlay)" opacity="0.5"/>

      <!-- Shiny efekt - orta kısım parlaklığını azaltılmış -->
      <rect x="0" y="0" width="${width}" height="${height}" rx="16" ry="16"
            fill="url(#shinyGradient-${index})" opacity="0.2"
            class="shiny-effect-${index}">
        <animate attributeName="opacity" values="0;0.25;0" dur="1.5s"
                 begin="${index * 0.2}s" repeatCount="1"
                 fill="freeze"/>
      </rect>

      <!-- Yarı çember progress bar arka planı - mevcut component'tekiyle aynı -->
      <path d="M 15 75 A 52 52 0 0 1 155 75"
            transform="translate(${progressBarX - x}, ${progressBarY - y})"
            fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="5" stroke-linecap="round"/>

      <!-- Yarı çember progress bar - mevcut component'tekiyle aynı -->
      <path d="M 15 75 A 52 52 0 0 1 155 75"
            transform="translate(${progressBarX - x}, ${progressBarY - y})"
            fill="none" stroke="url(#progressGradient-${index})" stroke-width="7" stroke-linecap="round"
            class="progress-bar-${index}"
            stroke-dasharray="163.36" stroke-dashoffset="163.36"/>

      <!-- İkon -->
      <g transform="translate(${iconX - x}, ${iconY - y})" class="icon-${index}">
        ${getAnimatedIcon(iconName, index)}
      </g>

      <!-- Değer - mevcut component'teki font ayarlarıyla aynı -->
      <text x="${valueX - x}" y="${valueY - y}" text-anchor="start" class="value-${index} stat-value"
            fill="${stat.color}" font-family="Arial, sans-serif" font-size="16.8" font-weight="700">
        ${formatNumber(stat.value, index === 0)}
      </text>

      <!-- Etiket - mevcut component'teki pozisyon ve font ayarlarıyla aynı -->
      <text x="${width/2}" y="${labelY - y}" text-anchor="middle" class="stat-label"
            fill="rgba(255,255,255,0.8)" font-family="Arial, sans-serif" font-size="13.6" font-weight="600"
            text-transform="uppercase" letter-spacing="0.1px">
        ${stat.label}
      </text>

      <!-- Date Range (eğer varsa) - mevcut component'tekiyle aynı -->
      ${stat.dateRange ? `
        <text x="${width/2}" y="${labelY - y + 12}" text-anchor="middle" class="date-range"
              fill="rgba(255,255,255,0.6)" font-family="Arial, sans-serif" font-size="10.4" font-weight="400"
              letter-spacing="0.05px">
          ${stat.dateRange}
        </text>
      ` : ''}
    </g>
  `
}

// Mevcut component'teki animasyonlu ikonları SVG'ye dönüştür
function getAnimatedIcon(iconName: string, index: number): string {
  switch(iconName) {
    case 'flame':
      return `
        <g class="flame-icon-${index}">
          <!-- Ana flame ikonu -->
          <svg width="24" height="24" viewBox="0 0 16 16" x="0" y="0">
            <defs>
              <linearGradient id="flameGradient-${index}" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#ff6b35"/>
                <stop offset="50%" stop-color="#ff4500"/>
                <stop offset="100%" stop-color="#ff6347"/>
              </linearGradient>
            </defs>
            <path d="M9.13 15l-.53-.77a1.85 1.85 0 0 0-.28-2.54 3.51 3.51 0 0 1-1.19-2c-1.56 2.23-.75 3.46 0 4.55l-.55.76A4.4 4.4 0 0 1 3 10.46S2.79 8.3 5.28 6.19c0 0 2.82-2.61 1.84-4.54L7.83 1a6.57 6.57 0 0 1 2.61 6.94 2.57 2.57 0 0 0 .56-.81l.87-.07c.07.12 1.84 2.93.89 5.3A4.72 4.72 0 0 1 9.13 15zm-2-6.95l.87.39a3 3 0 0 0 .92 2.48 2.64 2.64 0 0 1 1 2.8A3.241 3.241 0 0 0 11.8 12a4.87 4.87 0 0 0-.41-3.63 1.85 1.85 0 0 1-1.84.86l-.35-.68a5.31 5.31 0 0 0-.89-5.8C8.17 4.87 6 6.83 5.93 6.94 3.86 8.7 4 10.33 4 10.4a3.47 3.47 0 0 0 1.59 3.14C5 12.14 5 10.46 7.16 8.05h-.03z"
                  fill="url(#flameGradient-${index})"/>
          </svg>

          <!-- Spark particles - artırılmış ve çoklu seviye -->
          ${[
            // Alt seviye (mevcut seviyede)
            ...[0, 1, 2, 3, 4, 5, 6].map(i => ({
              x: (i - 3) * 3 + 12,
              y: 6,
              delay: i * 0.4,
              size: 1.25
            })),
            // Orta seviye (daha yukarıda)
            ...[7, 8, 9].map(i => ({
              x: ((i - 8) * 4) + 12,
              y: -2,
              delay: (i - 7) * 0.7,
              size: 1.0
            })),
            // Üst seviye (en yukarıda, tutuşma efekti için)
            ...[10, 11].map(i => ({
              x: ((i - 10.5) * 6) + 12,
              y: -8,
              delay: (i - 10) * 1.1,
              size: 0.8
            }))
          ].map((spark, i) => `
            <circle cx="${spark.x}" cy="${spark.y}" r="${spark.size}" fill="#ff6b35"
                    class="spark-${index}-${i}"
                    opacity="0">
              <animate attributeName="cy" values="${spark.y};${spark.y - 8};${spark.y}" dur="2.5s"
                       repeatCount="indefinite" begin="${spark.delay}s"/>
              <animate attributeName="cx" values="${spark.x};${spark.x + (Math.random() - 0.5) * 3};${spark.x}" dur="2.5s"
                       repeatCount="indefinite" begin="${spark.delay}s"/>
              <animate attributeName="opacity" values="0;${spark.y < 0 ? 0.7 : 0.8};0" dur="2.5s"
                       repeatCount="indefinite" begin="${spark.delay}s"/>
              <animate attributeName="r" values="${spark.size * 0.3};${spark.size * 0.8};${spark.size * 0.3}" dur="2.5s"
                       repeatCount="indefinite" begin="${spark.delay}s"/>
            </circle>
          `).join('')}
        </g>
      `

    case 'star':
      return `
        <g class="star-icon-${index}">
          <!-- Ana star ikonu -->
          <svg width="24" height="24" viewBox="0 0 24 24" x="0" y="0">
            <defs>
              <linearGradient id="starGradient-${index}" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#ffd700"/>
                <stop offset="50%" stop-color="#ffed4e"/>
                <stop offset="100%" stop-color="#ffa500"/>
              </linearGradient>
              <!-- Glow efekti için filter -->
              <filter id="starGlow-${index}" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              <!-- Parlak sarı sparkle gradient -->
              <linearGradient id="starSparkleGradient-${index}" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#fff8dc"/>
                <stop offset="50%" stop-color="#ffd700"/>
                <stop offset="100%" stop-color="#ffed4e"/>
              </linearGradient>
            </defs>
            <path d="M22,9.67A1,1,0,0,0,21.14,9l-5.69-.83L12.9,3a1,1,0,0,0-1.8,0L8.55,8.16,2.86,9a1,1,0,0,0-.81.68,1,1,0,0,0,.25,1l4.13,4-1,5.68a1,1,0,0,0,.4,1,1,1,0,0,0,1.05.07L12,18.76l5.1,2.68a.93.93,0,0,0,.46.12,1,1,0,0,0,.59-.19,1,1,0,0,0,.4-1l-1-5.68,4.13-4A1,1,0,0,0,22,9.67Zm-6.15,4a1,1,0,0,0-.29.89l.72,4.19-3.76-2a1,1,0,0,0-.94,0l-3.76,2,.72-4.19a1,1,0,0,0-.29-.89l-3-3,4.21-.61a1,1,0,0,0,.76-.55L12,5.7l1.88,3.82a1,1,0,0,0,.76.55l4.21.61Z"
                  fill="url(#starGradient-${index})"
                  filter="url(#starGlow-${index})"
                  class="star-main-${index}"/>
          </svg>

          <!-- Star sparkle efektleri - çok küçük yıldızlar (yıldızın etrafına rastgele dağıtılmış) -->
          ${[
            { delay: 0 }, { delay: 0.5 }, { delay: 1 }, { delay: 1.5 },
            { delay: 2 }, { delay: 2.5 }, { delay: 0.8 }, { delay: 1.2 }
          ].map((spark, i) => {
            // Yıldızın merkezinden rastgele konumlar (merkez yaklaşık 12,12)
            const centerX = 12;
            const centerY = 12;
            const angle = (Math.PI * 0.75) + ((i / 8) * (Math.PI * 1.25)); // 135°-315° arası sabit konumlar
            const distance = 6 + ((i % 3) * 3) + (Math.sin(i * 0.5) * 2); // 6-14 arası yarıçap (daha uzak)
            const x = centerX + Math.cos(angle) * distance;
            const y = centerY + Math.sin(angle) * distance;
            return `
            <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="0.8"
                    fill="#ffffff" class="star-spark-${index}-${i}">
              <animate attributeName="r" values="0.8;1.4;0.8" dur="2s"
                       repeatCount="indefinite" begin="${spark.delay}s"/>
              <animate attributeName="opacity" values="0.6;1;0.6" dur="2s"
                       repeatCount="indefinite" begin="${spark.delay}s"/>
              <animate attributeName="fill" values="#ffffff;#ffd700;#ffffff" dur="2s"
                       repeatCount="indefinite" begin="${spark.delay}s"/>
            </circle>
          `}).join('')}
        </g>
      `

    case 'trendingUp':
      return `
        <g class="trend-icon-${index}">
          <!-- Ana trend ikonu -->
          <svg width="24" height="24" viewBox="0 0 24 24" x="0" y="0">
            <defs>
              <linearGradient id="trendGradient-${index}" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#3b82f6"/>
                <stop offset="50%" stop-color="#60a5fa"/>
                <stop offset="100%" stop-color="#93c5fd"/>
              </linearGradient>
            </defs>
            <path d="M20.684 4.042A1.029 1.029 0 0 1 22 5.03l-.001 5.712a1.03 1.03 0 0 1-1.647.823L18.71 10.33l-4.18 5.568a1.647 1.647 0 0 1-2.155.428l-.15-.1-3.337-2.507-4.418 5.885c-.42.56-1.185.707-1.777.368l-.144-.095a1.372 1.372 0 0 1-.368-1.776l.095-.144 5.077-6.762a1.646 1.646 0 0 1 2.156-.428l.149.1 3.336 2.506 3.522-4.69-1.647-1.237a1.03 1.03 0 0 1 .194-1.76l.137-.05 5.485-1.595-.001.001z"
                  fill="url(#trendGradient-${index})"/>
          </svg>

          <!-- Çapraz yukarı çıkış efektleri - mevcut component'teki gibi -->
          ${[0, 1, 2, 3].map(i => `
            <rect x="${4 + i * 5}" y="16" width="2.2" height="5"
                  fill="url(#trendGradient-${index})" rx="1"
                  class="trend-cross-${index}-${i}">
              <animate attributeName="y" values="16;1;16" dur="2.8s"
                       repeatCount="indefinite" begin="${i * 0.7}s"/>
              <animate attributeName="x" values="${4 + i * 5};${4 + i * 5 - 7.5};${4 + i * 5}" dur="2.8s"
                       repeatCount="indefinite" begin="${i * 0.7}s"/>
              <animate attributeName="opacity" values="0;0.9;0" dur="2.8s"
                       repeatCount="indefinite" begin="${i * 0.7}s"/>
              <animate attributeName="height" values="1.65;4.5;1.65" dur="2.8s"
                       repeatCount="indefinite" begin="${i * 0.7}s"/>
            </rect>
          `).join('')}


        </g>
      `

    case 'calendar':
      return `
        <g class="calendar-icon-${index}">
          <!-- Ana calendar ikonu -->
          <svg width="24" height="24" viewBox="0 0 24 24" x="0" y="0">
            <defs>
              <linearGradient id="calendarGradient-${index}" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#22c55e"/>
                <stop offset="50%" stop-color="#16a34a"/>
                <stop offset="100%" stop-color="#15803d"/>
              </linearGradient>
            </defs>
            <path fill-rule="evenodd" d="M17,2 C17.5522847,2 18,2.44771525 18,3 L18,4 L19,4 C20.6568542,4 22,5.34314575 22,7 L22,19 C22,20.6568542 20.6568542,22 19,22 L5,22 C3.34314575,22 2,20.6568542 2,19 L2,7 C2,5.34314575 3.34314575,4 5,4 L6,4 L6,3 C6,2.44771525 6.44771525,2 7,2 C7.55228475,2 8,2.44771525 8,3 L8,4 L16,4 L16,3 C16,2.44771525 16.4477153,2 17,2 Z M4,12 L4,19 C4,19.5522847 4.44771525,20 5,20 L19,20 C19.5522847,20 20,19.5522847 20,19 L20,12 L4,12 Z M4,10 L20,10 L20,7 C20,6.44771525 19.5522847,6 19,6 L18,6 L18,7 C18,7.55228475 17.5522847,8 17,8 C16.4477153,8 16,7.55228475 16,7 L16,6 L8,6 L8,7 C8,7.55228475 7.55228475,8 7,8 C6.44771525,8 6,7.55228475 6,7 L6,6 L5,6 C4.44771525,6 4,6.44771525 4,7 L4,10 Z"
                  fill="url(#calendarGradient-${index})"/>
          </svg>

          <!-- Pulsing dots - çok küçük ve çok sayıda (alev spark gibi) -->
          ${[
            // Ana noktalar (küçük)
            { x: 7, y: 16, r: 0.8 }, { x: 17, y: 16, r: 0.8 }, { x: 12, y: 13, r: 0.8 },
            { x: 9, y: 19, r: 0.8 }, { x: 15, y: 19, r: 0.8 }, { x: 5, y: 14, r: 0.8 },
            { x: 19, y: 14, r: 0.8 },
            // Ek küçük noktalar
            { x: 10, y: 15, r: 0.6 }, { x: 14, y: 15, r: 0.6 }, { x: 8, y: 17, r: 0.6 },
            { x: 16, y: 17, r: 0.6 }, { x: 11, y: 18, r: 0.6 }, { x: 13, y: 18, r: 0.6 },
            { x: 6, y: 16, r: 0.6 }, { x: 18, y: 16, r: 0.6 }, { x: 12, y: 16, r: 0.6 },
            // Çok küçük noktalar (alev spark etkisi için)
            { x: 8.5, y: 14.5, r: 0.4 }, { x: 15.5, y: 14.5, r: 0.4 }, { x: 11.5, y: 17.5, r: 0.4 },
            { x: 12.5, y: 17.5, r: 0.4 }, { x: 9.5, y: 16.5, r: 0.4 }, { x: 14.5, y: 16.5, r: 0.4 }
          ].map((dot, i) => `
            <circle cx="${dot.x}" cy="${dot.y}" r="${dot.r}"
                    fill="#22c55e" class="calendar-dot-${index}-${i}">
              <animate attributeName="r" values="${dot.r};${dot.r * 1.5};${dot.r}" dur="2.5s"
                       repeatCount="indefinite" begin="${i * 0.2}s"/>
              <animate attributeName="opacity" values="0.4;${dot.r > 0.6 ? 0.9 : 0.7};0.4" dur="2.5s"
                       repeatCount="indefinite" begin="${i * 0.2}s"/>
            </circle>
          `).join('')}
        </g>
      `

    default:
      return ''
  }
}

function createSVGAnimations(): string {
  return `
    <style>
      /* Progress bar animasyonları - mevcut component'teki 1.5s duration ile aynı */
      .progress-bar-0 { animation: progress0 1.5s ease-out forwards; }
      .progress-bar-1 { animation: progress1 1.5s ease-out 0.2s forwards; }
      .progress-bar-2 { animation: progress2 1.5s ease-out 0.4s forwards; }
      .progress-bar-3 { animation: progress3 1.5s ease-out 0.6s forwards; }

      @keyframes progress0 { to { stroke-dashoffset: 0; } }
      @keyframes progress1 { to { stroke-dashoffset: 0; } }
      @keyframes progress2 { to { stroke-dashoffset: 0; } }
      @keyframes progress3 { to { stroke-dashoffset: 0; } }

      /* İkon animasyonları - mevcut component'teki framer-motion animasyonlarının SVG versiyonu */

      /* Flame ikonu - mevcut component'teki scale ve opacity animasyonları (azaltılmış) */
      .flame-icon-1 {
        animation: flameScale 2.5s ease-in-out infinite;
      }

      @keyframes flameScale {
        0%, 100% { transform: scale(1); opacity: 1; }
        25% { transform: scale(1.01); opacity: 0.98; }
        50% { transform: scale(0.99); opacity: 1; }
        75% { transform: scale(1.005); opacity: 0.99; }
      }

      /* Star ikonu - mevcut component'teki pulse + rotate jitter animasyonları */
      .star-icon-2 {
        animation: starPulse 2.5s ease-in-out infinite,
                   starRotate 4s ease-in-out infinite;
      }

      @keyframes starPulse {
        0%, 100% { transform: scale(1); opacity: 1; }
        25% { transform: scale(1.08); opacity: 0.9; }
        50% { transform: scale(1); opacity: 1; }
      }

      @keyframes starRotate {
        0%, 100% { transform: rotate(0deg); }
        25% { transform: rotate(2deg); }
        50% { transform: rotate(-2deg); }
        75% { transform: rotate(0deg); }
      }

      /* TrendingUp ikonu - mevcut component'teki y ve scale animasyonları */
      .trend-icon-0 {
        animation: trendFloat 2s ease-in-out infinite;
      }

      @keyframes trendFloat {
        0%, 100% { transform: translateY(0px) scale(1); }
        50% { transform: translateY(-3px) scale(1.05); }
      }

      /* Calendar ikonu - mevcut component'teki scale ve y animasyonları */
      .calendar-icon-3 {
        animation: calendarPulse 2.5s ease-in-out infinite;
      }

      @keyframes calendarPulse {
        0%, 100% { transform: scale(1) translateY(0px); }
        50% { transform: scale(1.03) translateY(-1px); }
      }

      /* Değer animasyonları - mevcut component'teki react-spring animasyonları */
      .value-0 { animation: valueFadeIn0 2s ease-out forwards; opacity: 0; }
      .value-1 { animation: valueFadeIn1 1.5s ease-out forwards; opacity: 0; }
      .value-2 { animation: valueFadeIn2 1.5s ease-out forwards; opacity: 0; }
      .value-3 { animation: valueFadeIn3 1.5s ease-out forwards; opacity: 0; }

      @keyframes valueFadeIn0 { to { opacity: 1; } }
      @keyframes valueFadeIn1 { to { opacity: 1; } }
      @keyframes valueFadeIn2 { to { opacity: 1; } }
      @keyframes valueFadeIn3 { to { opacity: 1; } }

      /* Genel fade-in animasyonu */
      .card-group {
        animation: fadeInUp 0.6s ease-out forwards;
        opacity: 0;
      }

      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(8px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    </style>
  `
}

function createGradients(): string {
  return `
    <defs>
      <!-- Kart ana background gradient'leri - mevcut component'teki gibi -->
      <linearGradient id="cardMainBg-0" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="rgba(22, 25, 28, 0.98)"/>
        <stop offset="100%" stop-color="rgba(30, 33, 36, 0.95)"/>
      </linearGradient>

      <linearGradient id="cardMainBg-1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="rgba(22, 25, 28, 0.98)"/>
        <stop offset="100%" stop-color="rgba(30, 33, 36, 0.95)"/>
      </linearGradient>

      <linearGradient id="cardMainBg-2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="rgba(22, 25, 28, 0.98)"/>
        <stop offset="100%" stop-color="rgba(30, 33, 36, 0.95)"/>
      </linearGradient>

      <linearGradient id="cardMainBg-3" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="rgba(22, 25, 28, 0.98)"/>
        <stop offset="100%" stop-color="rgba(30, 33, 36, 0.95)"/>
      </linearGradient>

      <!-- Kart iç glow efektleri - orta kısım parlaklığını azaltılmış -->
      <radialGradient id="cardInnerGlow-0" cx="50%" cy="50%" r="70%">
        <stop offset="0%" stop-color="rgba(255, 255, 255, 0.04)"/>
        <stop offset="70%" stop-color="transparent"/>
      </radialGradient>

      <linearGradient id="cardInnerGlow-0-overlay" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="rgba(255, 255, 255, 0.03)"/>
        <stop offset="100%" stop-color="transparent"/>
      </linearGradient>

      <radialGradient id="cardInnerGlow-1" cx="50%" cy="50%" r="70%">
        <stop offset="0%" stop-color="rgba(255, 255, 255, 0.04)"/>
        <stop offset="70%" stop-color="transparent"/>
      </radialGradient>

      <linearGradient id="cardInnerGlow-1-overlay" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="rgba(255, 255, 255, 0.03)"/>
        <stop offset="100%" stop-color="transparent"/>
      </linearGradient>

      <radialGradient id="cardInnerGlow-2" cx="50%" cy="50%" r="70%">
        <stop offset="0%" stop-color="rgba(255, 255, 255, 0.04)"/>
        <stop offset="70%" stop-color="transparent"/>
      </radialGradient>

      <linearGradient id="cardInnerGlow-2-overlay" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="rgba(255, 255, 255, 0.03)"/>
        <stop offset="100%" stop-color="transparent"/>
      </linearGradient>

      <radialGradient id="cardInnerGlow-3" cx="50%" cy="50%" r="70%">
        <stop offset="0%" stop-color="rgba(255, 255, 255, 0.04)"/>
        <stop offset="70%" stop-color="transparent"/>
      </radialGradient>

      <linearGradient id="cardInnerGlow-3-overlay" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="rgba(255, 255, 255, 0.03)"/>
        <stop offset="100%" stop-color="transparent"/>
      </linearGradient>



      <!-- Kart shadow efektleri - mevcut component'teki box-shadow ile aynı -->
      <filter id="cardShadow-0" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="8" flood-color="rgba(0,0,0,0.3)" flood-opacity="1"/>
        <feDropShadow dx="0" dy="0" flood-color="rgba(255,255,255,0.1)" flood-opacity="1"/>
        <feDropShadow dx="0" dy="1" flood-color="rgba(255,255,255,0.2)" flood-opacity="0.5"/>
      </filter>

      <filter id="cardShadow-1" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="8" flood-color="rgba(0,0,0,0.3)" flood-opacity="1"/>
        <feDropShadow dx="0" dy="0" flood-color="rgba(255,255,255,0.1)" flood-opacity="1"/>
        <feDropShadow dx="0" dy="1" flood-color="rgba(255,255,255,0.2)" flood-opacity="0.5"/>
      </filter>

      <filter id="cardShadow-2" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="8" flood-color="rgba(0,0,0,0.3)" flood-opacity="1"/>
        <feDropShadow dx="0" dy="0" flood-color="rgba(255,255,255,0.1)" flood-opacity="1"/>
        <feDropShadow dx="0" dy="1" flood-color="rgba(255,255,255,0.2)" flood-opacity="0.5"/>
      </filter>

      <filter id="cardShadow-3" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="8" flood-color="rgba(0,0,0,0.3)" flood-opacity="1"/>
        <feDropShadow dx="0" dy="0" flood-color="rgba(255,255,255,0.1)" flood-opacity="1"/>
        <feDropShadow dx="0" dy="1" flood-color="rgba(255,255,255,0.2)" flood-opacity="0.5"/>
      </filter>

      <!-- Progress bar gradient'leri - mevcut component'tekiyle aynı -->
      <linearGradient id="progressGradient-0" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#60a5fa" stop-opacity="0.4"/>
        <stop offset="50%" stop-color="#60a5fa" stop-opacity="0.8"/>
        <stop offset="100%" stop-color="#60a5fa" stop-opacity="0.6"/>
      </linearGradient>

      <linearGradient id="progressGradient-1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#f87171" stop-opacity="0.4"/>
        <stop offset="50%" stop-color="#f87171" stop-opacity="0.8"/>
        <stop offset="100%" stop-color="#f87171" stop-opacity="0.6"/>
      </linearGradient>

      <linearGradient id="progressGradient-2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fbbf24" stop-opacity="0.4"/>
        <stop offset="50%" stop-color="#fbbf24" stop-opacity="0.8"/>
        <stop offset="100%" stop-color="#fbbf24" stop-opacity="0.6"/>
      </linearGradient>

      <linearGradient id="progressGradient-3" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#34d399" stop-opacity="0.4"/>
        <stop offset="50%" stop-color="#34d399" stop-opacity="0.8"/>
        <stop offset="100%" stop-color="#34d399" stop-opacity="0.6"/>
      </linearGradient>

      <!-- Shiny efekt gradient'leri - orta kısım parlaklığını azaltılmış -->
      <linearGradient id="shinyGradient-0" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="transparent"/>
        <stop offset="20%" stop-color="rgba(255,255,255,0.5)"/>
        <stop offset="40%" stop-color="rgba(255,255,255,0.25)"/>
        <stop offset="60%" stop-color="rgba(255,255,255,0.1)"/>
        <stop offset="80%" stop-color="transparent"/>
        <animate attributeName="x1" values="-100%;200%" dur="1.5s" begin="0s" repeatCount="1" fill="freeze"/>
        <animate attributeName="x2" values="0%;300%" dur="1.5s" begin="0s" repeatCount="1" fill="freeze"/>
      </linearGradient>

      <linearGradient id="shinyGradient-1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="transparent"/>
        <stop offset="20%" stop-color="rgba(255,255,255,0.5)"/>
        <stop offset="40%" stop-color="rgba(255,255,255,0.25)"/>
        <stop offset="60%" stop-color="rgba(255,255,255,0.1)"/>
        <stop offset="80%" stop-color="transparent"/>
        <animate attributeName="x1" values="-100%;200%" dur="1.5s" begin="0.2s" repeatCount="1" fill="freeze"/>
        <animate attributeName="x2" values="0%;300%" dur="1.5s" begin="0.2s" repeatCount="1" fill="freeze"/>
      </linearGradient>

      <linearGradient id="shinyGradient-2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="transparent"/>
        <stop offset="20%" stop-color="rgba(255,255,255,0.5)"/>
        <stop offset="40%" stop-color="rgba(255,255,255,0.25)"/>
        <stop offset="60%" stop-color="rgba(255,255,255,0.1)"/>
        <stop offset="80%" stop-color="transparent"/>
        <animate attributeName="x1" values="-100%;200%" dur="1.5s" begin="0.4s" repeatCount="1" fill="freeze"/>
        <animate attributeName="x2" values="0%;300%" dur="1.5s" begin="0.4s" repeatCount="1" fill="freeze"/>
      </linearGradient>

      <linearGradient id="shinyGradient-3" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="transparent"/>
        <stop offset="20%" stop-color="rgba(255,255,255,0.5)"/>
        <stop offset="40%" stop-color="rgba(255,255,255,0.25)"/>
        <stop offset="60%" stop-color="rgba(255,255,255,0.1)"/>
        <stop offset="80%" stop-color="transparent"/>
        <animate attributeName="x1" values="-100%;200%" dur="1.5s" begin="0.6s" repeatCount="1" fill="freeze"/>
        <animate attributeName="x2" values="0%;300%" dur="1.5s" begin="0.6s" repeatCount="1" fill="freeze"/>
      </linearGradient>
    </defs>
  `
}

function generateSVG(stats: GitHubStats): string {
  // Mevcut component'teki date hesaplaması fonksiyonları
  function formatDate(dateString: string): string {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  // Ana background: sabit koyu renk (kartların gradientlerinden bağımsız)
  const mainBackground = `
    <rect width="100%" height="100%" fill="#0d1117"/>
  `

  function getCurrentStreakDates() {
    if (!stats.contributions.weeks) return null

    const allContributions: { date: string, count: number }[] = []
    stats.contributions.weeks.forEach((week) => {
      week.contributionDays.forEach((day) => {
        allContributions.push({
          date: day.date,
          count: day.contributionCount || day.count || 0
        })
      })
    })

    const sortedContributions = allContributions
      .filter(day => (day.count || 0) > 0)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    if (sortedContributions.length === 0) return null

    const endDate = new Date(sortedContributions[0].date)

    let startDate = new Date(endDate)
    let streakLength = 1

    for (let i = 1; i < sortedContributions.length; i++) {
      const currentDate = new Date(sortedContributions[i].date)
      const daysDiff = Math.floor((endDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24))

      if (daysDiff === streakLength) {
        startDate = new Date(currentDate)
        streakLength++
      } else {
        break
      }
    }

    return {
      start: formatDate(startDate.toISOString().split('T')[0]),
      end: formatDate(endDate.toISOString().split('T')[0])
    }
  }

  function getLongestStreakDates() {
    if (!stats.contributions.weeks) return null

    const allContributions: { date: string, count: number }[] = []
    stats.contributions.weeks.forEach((week) => {
      week.contributionDays.forEach((day) => {
        allContributions.push({
          date: day.date,
          count: day.contributionCount || day.count || 0
        })
      })
    })

    const sortedContributions = allContributions
      .filter(day => (day.count || 0) > 0)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    if (sortedContributions.length === 0) return null

    let longestStreakStart = new Date(sortedContributions[0].date)
    let longestStreakEnd = new Date(sortedContributions[0].date)
    let currentStreakStart = new Date(sortedContributions[0].date)
    let currentStreakLength = 1
    let longestStreakLength = 1

    for (let i = 1; i < sortedContributions.length; i++) {
      const prevDate = new Date(sortedContributions[i - 1].date)
      const currentDate = new Date(sortedContributions[i].date)
      const daysDiff = Math.floor((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24))

      if (daysDiff === 1) {
        currentStreakLength++
        if (currentStreakLength > longestStreakLength) {
          longestStreakLength = currentStreakLength
          longestStreakStart = new Date(currentStreakStart)
          longestStreakEnd = new Date(currentDate)
        }
      } else {
        currentStreakStart = new Date(currentDate)
        currentStreakLength = 1
      }
    }

    return {
      start: formatDate(longestStreakStart.toISOString().split('T')[0]),
      end: formatDate(longestStreakEnd.toISOString().split('T')[0])
    }
  }

  const statsData = [
    // 1. Total Contributions (soldan 1.)
    {
      icon: 'trendingUp',
      value: stats.contributions.totalContributions,
      label: 'Total Contributions',
      dateRange: stats?.user?.created_at ? `${formatDate(stats.user.created_at)} - Present` : null,
      color: COLORS.stats.contributions,
      bgColor: 'rgba(96, 165, 250, 0.1)',
      borderColor: 'rgba(96, 165, 250, 0.3)',
      progress: Math.min(((stats.contributions.totalContributions || 0) / 1000) * 100, 100),
      animated: true
    },
    // 2. Current Streak (soldan 2.)
    {
      icon: 'flame',
      value: stats.streak.current,
      label: 'Current Streak',
      dateRange: getCurrentStreakDates() ? `${getCurrentStreakDates()?.start} - ${getCurrentStreakDates()?.end}` : null,
      color: COLORS.stats.currentStreak,
      bgColor: 'rgba(248, 113, 113, 0.1)',
      borderColor: 'rgba(248, 113, 113, 0.3)',
      progress: Math.min(((stats.streak.current || 0) / 30) * 100, 100),
      animated: true
    },
    // 3. Longest Streak (soldan 3.)
    {
      icon: 'star',
      value: stats.streak.longest,
      label: 'Longest Streak',
      dateRange: getLongestStreakDates() ? `${getLongestStreakDates()?.start} - ${getLongestStreakDates()?.end}` : null,
      color: COLORS.stats.longestStreak,
      bgColor: 'rgba(251, 191, 36, 0.1)',
      borderColor: 'rgba(251, 191, 36, 0.3)',
      progress: Math.min(((stats.streak.longest || 0) / 50) * 100, 100),
      animated: true
    },
    // 4. Total Active Days (soldan 4.)
    {
      icon: 'calendar',
      value: stats.streak.total,
      label: 'Total Active Days',
      dateRange: null,
      color: COLORS.stats.activeDays,
      bgColor: 'rgba(52, 211, 153, 0.1)',
      borderColor: 'rgba(52, 211, 153, 0.3)',
      progress: Math.min(((stats.streak.total || 0) / 365) * 100, 100),
      animated: true
    }
  ]

  // Mevcut component'teki kart boyutları ve layout
  const cardWidth = 240
  const cardHeight = 175
  const gap = 20
  const totalWidth = (cardWidth * 4) + (gap * 3) + 40 // 40px padding
  const totalHeight = cardHeight + 40 // 40px padding

  let svgContent = createSVGAnimations()
  svgContent += createGradients()

  // Tüm kartları tek bir grup içinde oluştur
  let cardsContent = `<g class="card-group">`

  // Kartları oluştur - mevcut component'teki pozisyonlarla aynı
  let currentX = 20
  statsData.forEach((stat, index) => {
    cardsContent += createSVGCard(currentX, 20, cardWidth, cardHeight, stat, index)
    currentX += cardWidth + gap
  })

  cardsContent += `</g>`

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${totalWidth}" height="${totalHeight}" viewBox="0 0 ${totalWidth} ${totalHeight}"
     xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  ${mainBackground}
  ${svgContent}
  ${cardsContent}
</svg>`
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

    // Mevcut API'den veriyi al
    const apiResponse = await fetch(`${request.nextUrl.origin}/api/github/${username}`)
    if (!apiResponse.ok) {
      throw new Error('Failed to fetch GitHub stats')
    }

    const stats: GitHubStats = await apiResponse.json()

    // SVG oluştur
    const svg = generateSVG(stats)

    // SVG yanıtını döndür
    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=300', // 5 dakika cache
      },
    })
  } catch (error) {
    console.error('Error generating SVG:', error)

    // Hata durumunda basit bir SVG döndür
    const errorSVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="400" height="100" viewBox="0 0 400 100" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="100" fill="#161b22" rx="8"/>
  <text x="200" y="55" text-anchor="middle" fill="#f87171" font-family="Arial, sans-serif" font-size="14">
    Error loading stats
  </text>
</svg>`

    return new NextResponse(errorSVG, {
      status: 500,
      headers: {
        'Content-Type': 'image/svg+xml',
      },
    })
  }
}

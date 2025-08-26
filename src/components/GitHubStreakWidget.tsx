'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useSearchParams, usePathname } from 'next/navigation'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { CssBaseline, Box, Card, CardContent, Typography } from '@mui/material'
import { motion } from 'framer-motion'
import { useSpring, animated } from 'react-spring'
import {
  TrendingUp,
  Flame,
  Star,
  Calendar
} from 'lucide-react'

// Özel ikon animasyon komponentleri
const FlameIconAnimated = () => (
  <motion.div
    style={{
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}
  >
    {/* Ana flame ikonu */}
    <motion.div
      animate={{
        scale: [1, 1.03, 0.97, 1.01, 1],
        opacity: [1, 0.95, 1, 0.98, 1]
      }}
      transition={{
        duration: 2.5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <Flame
        size={25}
        style={{
          background: 'linear-gradient(135deg, #ff6b35 0%, #ff4500 50%, #ff6347 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          filter: 'drop-shadow(0 0 9px rgba(255, 107, 53, 0.6))'
        }}
      />
    </motion.div>

    {/* Daha fazla spark particles - yarı çember için uyarlanmış - büyültülmüş */}
    {[0, 1, 2, 3, 4, 5, 6].map((i) => (
      <motion.div
        key={i}
        animate={{
          y: [-6, -12, -6],
          x: [0, (i - 3) * 3, 0],
          opacity: [0, 0.8, 0],
          scale: [0.3, 0.8, 0.3]
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          delay: i * 0.6,
          ease: "easeInOut"
        }}
        style={{
          position: 'absolute',
          top: '65%',
          left: '50%',
          width: '2.5px',
          height: '2.5px',
          backgroundColor: '#ff6b35',
          borderRadius: '50%',
          boxShadow: '0 0 6px rgba(255, 107, 53, 0.8)'
        }}
      />
    ))}
  </motion.div>
)

const StarIconAnimated = () => (
  <motion.div
    style={{
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',

    }}
  >
    {/* Ana yıldız - Subtle Pulse + Rotate Jitter */}
    <motion.div
      animate={{
        // Subtle Pulse
        scale: [1, 1.08, 1],
        opacity: [1, 0.9, 1],
        // Rotate Jitter
        rotate: [0, 2, -2, 0]
      }}
      transition={{
        scale: {
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut"
        },
        opacity: {
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut"
        },
        rotate: {
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }
      }}
    >
      <Star
        size={24}
        style={{
          background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 50%, #ffa500 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          filter: 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.6))'
        }}
      />
    </motion.div>

    {/* SVG Overlay - 5 Glow Rays */}
    <svg
      viewBox="0 0 24 24"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: 24,
        height: 24,
        pointerEvents: 'none'
      }}
    >
      <defs>
        <filter id="rayGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {[
        { angle: -54 },  // İlk girinti (sol üst)
        { angle: 18 },   // İkinci girinti (sağ üst)
        { angle: 90 },   // Üçüncü girinti (alt)
        { angle: 162 },  // Dördüncü girinti (sol alt)
        { angle: 234 }   // Beşinci girinti (sol üst)
      ].map((ray, i) => {
        const cx = 12;
        const cy = 12;
        const rStart = 8; // Küçük boşluk için büyütüldü
        const rayLength = 5; // Uzunluk kısaltıldı

        const startX = cx + rStart * Math.cos(ray.angle * Math.PI / 180);
        const startY = cy + rStart * Math.sin(ray.angle * Math.PI / 180);
        const endX = cx + (rStart + rayLength) * Math.cos(ray.angle * Math.PI / 180);
        const endY = cy + (rStart + rayLength) * Math.sin(ray.angle * Math.PI / 180);

        return (
          <motion.line
            key={i}
            x1={startX}
            y1={startY}
            x2={endX}
            y2={endY}
            stroke="#ffe066"
            strokeWidth="1.2"
            strokeLinecap="round"
            filter="url(#rayGlow)"
            animate={{
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 1.6,
              repeat: Infinity,
              delay: i * 0.25,
              ease: "easeInOut"
            }}
          />
        );
      })}
    </svg>
  </motion.div>
)

const TrendIconAnimated = () => (
  <motion.div
    style={{
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}
  >
    {/* Ana trend ikonu */}
    <motion.div
      animate={{
        y: [0, -3, 0],
        scale: [1, 1.05, 1]
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <TrendingUp
        size={24}
        style={{
          background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 50%, #93c5fd 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.6))'
        }}
      />
    </motion.div>

    {/* Çapraz yukarı çıkış efektleri - yarı çember için uyarlanmış - büyültülmüş */}
    {[0, 1, 2, 3].map((i) => (
      <motion.div
        key={i}
        animate={{
          y: [0, -15, 0],
          x: [0, i * 5 - 7.5, 0],
          opacity: [0, 0.9, 0],
          scale: [0.3, 0.9, 0.3]
        }}
        transition={{
          duration: 2.8,
          repeat: Infinity,
          delay: i * 0.7,
          ease: "easeOut"
        }}
        style={{
          position: 'absolute',
          top: '65%',
          left: `${45 + i * 5}%`,
          width: '2.2px',
          height: '5px',
          background: 'linear-gradient(to top, rgba(59, 130, 246, 0.9), rgba(59, 130, 246, 0.4))',
          borderRadius: '1px',
          transform: 'rotate(45deg)',
          boxShadow: '0 0 5px rgba(59, 130, 246, 0.7)'
        }}
      />
    ))}

    {/* Dalga efektleri - yarı çember için uyarlanmış - büyültülmüş */}
    <motion.div
      animate={{
        scaleX: [1, 1.4, 1],
        opacity: [0.4, 0.8, 0.4]
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      style={{
        position: 'absolute',
        top: '75%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '12px',
        height: '2px',
        background: 'linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.7), transparent)',
        borderRadius: '1px',
        boxShadow: '0 0 4px rgba(59, 130, 246, 0.6)'
      }}
    />
  </motion.div>
)

const CalendarIconAnimated = () => (
  <motion.div
    style={{
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}
  >
    {/* Ana calendar ikonu */}
    <motion.div
      animate={{
        scale: [1, 1.03, 1],
        y: [0, -1, 0]
      }}
      transition={{
        duration: 2.5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <Calendar
        size={24}
        style={{
          background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #15803d 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          filter: 'drop-shadow(0 0 8px rgba(34, 197, 94, 0.7))'
        }}
      />
    </motion.div>

    {/* Daha görünür pulsing dots - yarı çember için uyarlanmış - büyültülmüş */}
    {[
      { x: 35, y: 70 }, // Sol alt
      { x: 65, y: 72 }, // Sağ alt
      { x: 50, y: 60 }, // Orta üst
      { x: 40, y: 75 }, // Sol daha alt
      { x: 60, y: 77 }  // Sağ daha alt
    ].map((dot, i) => (
      <motion.div
        key={i}
        animate={{
          scale: [0.5, 1, 0.5],
          opacity: [0.4, 1, 0.4]
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          delay: i * 0.5,
          ease: "easeInOut"
        }}
        style={{
          position: 'absolute',
          top: `${dot.y}%`,
          left: `${dot.x}%`,
          width: '3px',
          height: '3px',
          backgroundColor: '#22c55e',
          borderRadius: '50%',
          boxShadow: '0 0 6px rgba(34, 197, 94, 0.9)'
        }}
      />
    ))}

    {/* Daha görünür ek noktalar - yarı çember için uyarlanmış - büyültülmüş */}
    {[
      { x: 25, y: 68 }, // Sol kenar
      { x: 75, y: 70 }  // Sağ kenar
    ].map((dot, i) => (
      <motion.div
        key={`extra-${i}`}
        animate={{
          scale: [0.4, 0.7, 0.4],
          opacity: [0.3, 0.8, 0.3]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          delay: 1.8 + i * 0.8,
          ease: "easeInOut"
        }}
        style={{
          position: 'absolute',
          top: `${dot.y}%`,
          left: `${dot.x}%`,
          width: '2px',
          height: '2px',
          backgroundColor: '#16a34a',
          borderRadius: '50%',
          boxShadow: '0 0 4px rgba(22, 163, 74, 0.8)'
        }}
      />
    ))}
  </motion.div>
)

interface GitHubUser {
  login: string
  id?: number
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

interface ContributionData {
  totalContributions: number
  weeks: any[]
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

interface GitHubStreakWidgetProps {
  username?: string
}

// GitHub Dark Theme (Primer)
const githubDarkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#58a6ff', // GitHub accent
    },
    background: {
      default: '#0d1117', // GitHub dark background
      paper: '#161b22', // GitHub card background
    },
    text: {
      primary: '#c9d1d9', // GitHub text default
      secondary: '#8b949e', // GitHub text muted
    },
    divider: '#30363d', // GitHub border
    action: {
      hover: 'rgba(177, 186, 196, 0.12)', // Subtle hover
      focus: 'rgba(177, 186, 196, 0.24)', // Focus state
    },
  },
  typography: {
    fontFamily: '"Mona Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji", system-ui',
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.2,
    },
    body1: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.75rem',
      lineHeight: 1.4,
    },
  },
  shape: {
    borderRadius: 12, // GitHub card border radius
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#0d1117',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#161b22',
          border: '1px solid #30363d',
          borderRadius: 12,
          transition: 'all 200ms ease-in-out',
          '&:hover': {
            borderColor: '#58a6ff',
            boxShadow: '0 0 0 1px rgba(88, 166, 255, 0.3)',
            transform: 'scale(1.02)',
          },
          '&:focus-visible': {
            outline: '2px solid #58a6ff',
            outlineOffset: 2,
          },
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '20px !important',
          '&:last-child': {
            paddingBottom: '20px !important',
          },
        },
      },
    },
  },
})

export default function GitHubStreakWidget({ username: propUsername }: GitHubStreakWidgetProps = {}) {
  const searchParams = useSearchParams()
  const pathname = usePathname()

  // Get username from props, URL path, or query parameters
  const getUsername = () => {
    if (propUsername) return propUsername

    // Check if we're on a dynamic route like /user/username
    const pathMatch = pathname?.match(/^\/user\/([^\/]+)/)
    if (pathMatch) return pathMatch[1]

    // Fallback to query parameter
    return searchParams.get('user') || 'erberkk'
  }

  const username = getUsername()

  const [stats, setStats] = useState<GitHubStats | null>({
    user: { login: '', avatar_url: '', name: '', bio: '', public_repos: 0, followers: 0, following: 0, created_at: '', email: '', company: '', location: '' },
    contributions: { totalContributions: 0, weeks: [{ contributionDays: [] }] },
    streak: { current: 0, longest: 0, total: 0 }
  })
  const [error, setError] = useState<string | null>(null)
  const fetchedUsernamesRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    // Eğer bu username için zaten çağrı yapıldıysa, tekrar yapma
    if (fetchedUsernamesRef.current.has(username)) return

    const fetchStats = async () => {
      try {
        fetchedUsernamesRef.current.add(username) // Bu username için çağrı yapıldığını kaydet

        const response = await fetch(`/api/github/${username}`)
        if (!response.ok) {
          throw new Error('Failed to fetch GitHub stats')
        }

        const data = await response.json()
        setStats(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      }
    }

    fetchStats()
  }, [username])

  const animatedValue = useSpring({
    contributions: stats?.contributions.totalContributions || 0,
    activeDays: stats?.streak.total || 0,
    from: { contributions: 0, activeDays: 0 },
    config: { duration: 2000 }
  })

  const streakSpring = useSpring({
    current: stats?.streak.current || 0,
    longest: stats?.streak.longest || 0,
    total: stats?.streak.total || 0,
    from: { current: 0, longest: 0, total: 0 },
    config: { duration: 1500 }
  })

  const cardVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  }

  // Tarih hesaplaması için yardımcı fonksiyonlar
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const getCurrentStreakDates = () => {
    if (!stats?.contributions.weeks) return null

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

    // En son contribution tarihi
    const endDate = new Date(sortedContributions[0].date)

    // Current streak'in başlangıç tarihini bul
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

  const getLongestStreakDates = () => {
    if (!stats?.contributions.weeks) return null

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
      icon: TrendingUp,
      value: stats?.contributions.totalContributions || 0,
      label: 'Total Contributions',
      dateRange: stats?.user?.created_at ? `${formatDate(stats.user.created_at)} - Present` : null,
      color: '#60a5fa',
      bgColor: 'rgba(96, 165, 250, 0.1)',
      borderColor: 'rgba(96, 165, 250, 0.3)',
      progress: Math.min(((stats?.contributions.totalContributions || 0) / 1000) * 100, 100), // Progress percentage
      animated: true
    },
    // 2. Current Streak (soldan 2.)
    {
      icon: Flame,
      value: stats?.streak.current || 0,
      label: 'Current Streak',
      dateRange: getCurrentStreakDates() ? `${getCurrentStreakDates()?.start} - ${getCurrentStreakDates()?.end}` : null,
      color: '#f87171',
      bgColor: 'rgba(248, 113, 113, 0.1)',
      borderColor: 'rgba(248, 113, 113, 0.3)',
      progress: Math.min(((stats?.streak.current || 0) / 30) * 100, 100),
      animated: true
    },
    // 3. Longest Streak (soldan 3.)
    {
      icon: Star,
      value: stats?.streak.longest || 0,
      label: 'Longest Streak',
      dateRange: getLongestStreakDates() ? `${getLongestStreakDates()?.start} - ${getLongestStreakDates()?.end}` : null,
      color: '#fbbf24',
      bgColor: 'rgba(251, 191, 36, 0.1)',
      borderColor: 'rgba(251, 191, 36, 0.3)',
      progress: Math.min(((stats?.streak.longest || 0) / 50) * 100, 100), // Progress percentage
      animated: true
    },
    // 4. Total Active Days (soldan 4.)
    {
      icon: Calendar,
      value: stats?.streak.total || 0,
      label: 'Total Active Days',
      dateRange: null,
      color: '#34d399',
      bgColor: 'rgba(52, 211, 153, 0.1)',
      borderColor: 'rgba(52, 211, 153, 0.3)',
      progress: Math.min(((stats?.streak.total || 0) / 365) * 100, 100), // Progress percentage
      animated: true
    }
  ]

  return (
    <ThemeProvider theme={githubDarkTheme}>
      <CssBaseline />
      <Box sx={{
        width: '100%',
        maxWidth: '1000px',
        height: '250px',
        p: 2,
        backgroundColor: '#0d1117'
      }}>
        <Box sx={{
          width: '100%',
          maxWidth: '1000px',
          mx: 'auto',
          height: '100%'
        }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(2, 1fr)', // 2 columns on mobile
                sm: 'repeat(2, 1fr)', // 2 columns on tablet
                md: 'repeat(4, 1fr)'  // 4 columns on desktop (1x4 grid)
              },
              gridTemplateRows: {
                xs: 'repeat(2, 1fr)', // 2 rows on mobile
                sm: 'repeat(2, 1fr)', // 2 rows on tablet
                md: '1fr'  // 1 row on desktop (1x4 grid)
              },
              gap: 2,
              height: '100%',
              placeItems: 'center',
              width: '100%'
            }}
          >
            {statsData.map((stat, index) => {
              const IconComponent = stat.icon
              return (
                <Box key={stat.label} sx={{ display: 'flex' }}>
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      transition: {
                        duration: 0.4,
                        delay: index * 0.06,
                        ease: "easeOut"
                      }
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{ width: '100%', height: '100%' }}
                  >
                    <Card
                      sx={{
                        height: '175px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: `linear-gradient(135deg, rgba(22, 25, 28, 0.98) 0%, rgba(30, 33, 36, 0.95) 100%)`,
                        backdropFilter: 'blur(20px)',
                        border: `1px solid ${stat.borderColor}`,
                        position: 'relative',
                        overflow: 'hidden',
                        transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
                        cursor: 'pointer',
                        borderRadius: '16px',
                        transform: 'translateY(-2px) scale(1.02)',
                        boxShadow: `
                          0 8px 32px rgba(0, 0, 0, 0.3),
                          0 0 0 1px rgba(255, 255, 255, 0.1),
                          inset 0 1px 0 rgba(255, 255, 255, 0.2)
                        `,
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: `
                            radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.08) 0%, transparent 50%),
                            linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, transparent 100%)
                          `,
                          pointerEvents: 'none'
                        }
                      }}
                    >

                                            <CardContent
                        sx={{
                          flex: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          position: 'relative',
                          zIndex: 2,
                          p: 0.75,
                          height: '100%',
                          width: '100%'
                        }}
                      >
                        {/* Semi-Circular Progress Bar with Icon and Text */}
                        <Box sx={{
                          position: 'relative',
                          width: '170px',
                          height: '90px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {/* Background Semi-Circle */}
                          <svg
                            width="170"
                            height="90"
                            viewBox="0 0 170 90"
                            style={{ position: 'absolute', top: '0px' }}
                          >
                            <path
                              d="M15 75
                                a 52 52 0 0 1 140 0"
                              fill="none"
                              stroke="rgba(255, 255, 255, 0.1)"
                              strokeWidth="5"
                              strokeLinecap="round"
                            />
                            {/* Progress Semi-Circle */}
                            <motion.path
                              d="M15 75
                                a 52 52 0 0 1 140 0"
                              fill="none"
                              stroke={`url(#semiGradient-${index})`}
                              strokeWidth="7"
                              strokeLinecap="round"
                              initial={{ pathLength: 0 }}
                              animate={{ pathLength: 1 }}
                              transition={{ duration: 1.5, delay: index * 0.2, ease: "easeOut" }}
                            />
                            <defs>
                              <linearGradient id={`semiGradient-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor={stat.color} stopOpacity="0.4" />
                                <stop offset="50%" stopColor={stat.color} stopOpacity="0.8" />
                                <stop offset="100%" stopColor={stat.color} stopOpacity="0.6" />
                              </linearGradient>
                            </defs>
                          </svg>

                          {/* Icon and Text Container */}
                          <Box sx={{
                            position: 'absolute',
                            top: '62%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            zIndex: 20,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 1.3
                          }}>
                            {/* Icon */}
                            <Box sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              {/* Özel ikon animasyonları - yarı çember için uyarlanmış - çok büyültülmüş */}
                              {stat.icon === Flame && (
                                <FlameIconAnimated />
                              )}
                              {stat.icon === Star && (
                                <StarIconAnimated />
                              )}
                              {stat.icon === TrendingUp && (
                                <TrendIconAnimated />
                              )}
                              {stat.icon === Calendar && (
                                <CalendarIconAnimated />
                              )}
                            </Box>

                            {/* Number/Value */}
                            <Box sx={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              {stat.animated ? (
                                <Typography
                                  variant="h6"
                                  sx={{
                                    color: stat.color,
                                    fontWeight: 700,
                                    fontSize: '1.05rem',
                                    lineHeight: 1
                                  }}
                                >
                                  {index === 0 && (
                                    <animated.span>
                                      {animatedValue.contributions.to(n => Math.floor(n).toLocaleString())}
                                    </animated.span>
                                  )}
                                  {index === 1 && (
                                    <animated.span>
                                      {streakSpring.current.to(n => Math.floor(n))}
                                    </animated.span>
                                  )}
                                  {index === 2 && (
                                    <animated.span>
                                      {streakSpring.longest.to(n => Math.floor(n))}
                                    </animated.span>
                                  )}
                                  {index === 3 && (
                                    <animated.span>
                                      {animatedValue.activeDays.to(n => Math.floor(n))}
                                    </animated.span>
                                  )}
                                </Typography>
                              ) : (
                                <Typography
                                  variant="h6"
                                  sx={{
                                    color: stat.color,
                                    fontWeight: 700,
                                    fontSize: '1.05rem',
                                    lineHeight: 1
                                  }}
                                >
                                  {stat.value.toLocaleString()}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </Box>

                        {/* Label Below Semi-Circle */}
                        <Box sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          textAlign: 'center',
                          mt: 0.15
                        }}>
                          <Typography
                            variant="caption"
                            sx={{
                              color: 'rgba(255, 255, 255, 0.8)',
                              fontSize: '0.85rem',
                              fontWeight: 600,
                              textTransform: 'uppercase',
                              letterSpacing: '0.1px',
                              lineHeight: 1.2,
                              wordSpacing: '0.2px',
                              whiteSpace: 'pre-line',
                              textAlign: 'center'
                            }}
                          >
                            {stat.label}
                          </Typography>
                          {stat.dateRange && (
                            <Typography
                              variant="caption"
                              sx={{
                                color: 'rgba(255, 255, 255, 0.6)',
                                fontSize: '0.65rem',
                                fontWeight: 400,
                                textTransform: 'none',
                                letterSpacing: '0.05px',
                                lineHeight: 1.1,
                                mt: 0.3,
                                textAlign: 'center'
                              }}
                            >
                              {stat.dateRange}
                            </Typography>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Box>
              )
            })}
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  )
}

import React, { Suspense } from 'react'
import GitHubStreakWidget from '../components/GitHubStreakWidget'

export default function Home() {
  return (
    <div style={{
      minHeight: '100vh',
      padding: '20px'
    }}>
      <Suspense fallback={
        <div style={{
          width: '1000px',
          height: '320px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#00d4ff',
          fontSize: '24px'
        }}>
          Loading Widget...
        </div>
      }>
        <GitHubStreakWidget />
      </Suspense>
    </div>
  )
}

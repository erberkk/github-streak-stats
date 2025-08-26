import React, { Suspense } from 'react'
import GitHubStreakWidget from '../../../components/GitHubStreakWidget'

interface PageProps {
  params: {
    username: string
  }
}

export default function UserPage({ params }: PageProps) {
  return (
    <main className="container mx-auto px-4 py-8">
      <Suspense fallback={
        <div className="streak-card max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-700 rounded w-48 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-700 rounded w-32 mx-auto"></div>
            </div>
          </div>
        </div>
      }>
        <GitHubStreakWidget />
      </Suspense>
    </main>
  )
}

export async function generateMetadata({ params }: PageProps) {
  return {
    title: `${params.username} - GitHub Streak Stats`,
    description: `GitHub contribution streak statistics for ${params.username}`,
  }
}

import CardGenerator from '@/components/CardGenerator'

interface PageProps {
  params: { username: string }
}

export default function UserPage({ params }: PageProps) {
  return (
    <main className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="mb-10 text-3xl font-bold tracking-tight">
        <a href={`https://github.com/${params.username}`} className="hover:text-orange-500">
          @{params.username}
        </a>
      </h1>
      <CardGenerator initialUsername={params.username} />
    </main>
  )
}

export function generateMetadata({ params }: PageProps) {
  return {
    title: `${params.username} - GitHub Streak Stats`,
    description: `GitHub contribution streak statistics for ${params.username}`,
  }
}

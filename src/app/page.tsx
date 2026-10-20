import CardGenerator from '@/components/CardGenerator'

export default function Home() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="text-3xl font-bold tracking-tight">GitHub Streak Stats</h1>
      <p className="mb-10 mt-2 text-[var(--muted)]">
        A clean, fast streak card for your GitHub profile README. Adapts to light and dark mode automatically.
      </p>
      <CardGenerator initialUsername="erberkk" />
    </main>
  )
}

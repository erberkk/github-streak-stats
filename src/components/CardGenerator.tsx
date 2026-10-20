'use client'

import { useEffect, useState } from 'react'

type Theme = 'auto' | 'dark' | 'light'

export default function CardGenerator({ initialUsername = '' }: { initialUsername?: string }) {
  const [input, setInput] = useState(initialUsername)
  const [username, setUsername] = useState(initialUsername)
  const [theme, setTheme] = useState<Theme>('auto')
  const [copied, setCopied] = useState(false)

  const [origin, setOrigin] = useState('')

  useEffect(() => setOrigin(window.location.origin), [])

  const query = theme === 'auto' ? '' : `?theme=${theme}`
  const src = `/api/github/${username}/svg${query}`
  const markdown = `[![GitHub Streak](${origin}${src})](${origin}/user/${username})`

  async function copy() {
    await navigator.clipboard.writeText(markdown)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="space-y-6">
      <form
        className="flex flex-col gap-3 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault()
          setUsername(input.trim())
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="GitHub username"
          className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--panel)] px-4 py-2.5 outline-none focus:border-orange-500"
        />
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value as Theme)}
          className="rounded-lg border border-[var(--border)] bg-[var(--panel)] px-3 py-2.5"
        >
          <option value="auto">Auto theme</option>
          <option value="dark">Dark</option>
          <option value="light">Light</option>
        </select>
        <button className="rounded-lg bg-orange-600 px-5 py-2.5 font-medium text-white hover:bg-orange-500">
          Generate
        </button>
      </form>

      {username && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={`${username}'s GitHub streak`} className="w-full" width={800} height={256} />
          <div className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-4">
            <div className="mb-2 flex items-center justify-between text-sm text-[var(--muted)]">
              <span>Markdown for your README</span>
              <button onClick={copy} className="rounded-md border border-[var(--border)] px-2.5 py-1 hover:text-[var(--text)]">
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <code className="block break-all text-sm">{markdown}</code>
          </div>
        </>
      )}
    </div>
  )
}

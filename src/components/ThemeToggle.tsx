'use client'

import { useMemo, useState } from 'react'

type Theme = 'light' | 'dark'

function readThemeFromDom(): Theme {
  const theme = document.documentElement.dataset.theme
  return theme === 'light' ? 'light' : 'dark'
}

function setTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme
  try {
    localStorage.setItem('theme', theme)
  } catch {
    // Ignore storage errors (private mode, disabled storage, etc.)
  }
}

export default function ThemeToggle() {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof document === 'undefined') return 'dark'
    return readThemeFromDom()
  })

  const nextTheme = useMemo<Theme>(
    () => (theme === 'dark' ? 'light' : 'dark'),
    [theme]
  )

  return (
    <button
      type="button"
      aria-label={`Switch to ${nextTheme} theme`}
      title={`Switch to ${nextTheme} theme`}
      onClick={() => {
        setTheme(nextTheme)
        setThemeState(nextTheme)
      }}
      className="inline-flex items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--bg-card)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--accent-40)] hover:text-[var(--text-primary)]"
    >
      {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
      <span className="hidden sm:inline">{theme === 'dark' ? 'Light' : 'Dark'}</span>
    </button>
  )
}

function SunIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M12 2v2M12 20v2M4 12H2M22 12h-2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M19.07 4.93l-1.41 1.41M6.34 17.66l-1.41 1.41"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M21 13.3A8.1 8.1 0 0 1 10.7 3a6.9 6.9 0 1 0 10.3 10.3Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  )
}

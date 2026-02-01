'use client'

import { useEffect, useState } from 'react'

interface Heading {
  readonly id: string
  readonly text: string
  readonly level: number
}

interface TableOfContentsProps {
  readonly headings: Heading[]
}

export default function TableOfContents({ headings }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((e) => e.isIntersecting)
        if (visible) {
          setActiveId(visible.target.id)
        }
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0.1 }
    )

    const elements = headings
      .map((h) => document.getElementById(h.id))
      .filter(Boolean) as HTMLElement[]

    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [headings])

  if (headings.length === 0) return null

  return (
    <nav className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto text-sm">
      <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
        On this page
      </h4>
      <ul className="space-y-1 border-l border-[var(--border)]">
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              className={`block border-l-2 py-1 transition-colors ${
                heading.level === 1 ? 'pl-3' : ''
              } ${heading.level === 2 ? 'pl-3' : ''} ${
                heading.level === 3 ? 'pl-6' : ''
              } ${heading.level === 4 ? 'pl-9' : ''} ${
                activeId === heading.id
                  ? 'border-[var(--accent)] text-[var(--accent)]'
                  : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

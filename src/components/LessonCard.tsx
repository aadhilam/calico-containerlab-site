'use client'

import Link from 'next/link'
import { useState } from 'react'
import type { Lesson } from '@/lib/lessons'

interface LessonCardProps {
  readonly lesson: Lesson
}

export default function LessonCard({ lesson }: LessonCardProps) {
  const [completed] = useState(() => {
    if (typeof window === 'undefined') return false
    const progress = JSON.parse(localStorage.getItem('lesson-progress') ?? '{}')
    return progress[lesson.slug] === true
  })

  return (
    <Link
      href={`/lessons/${lesson.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-card)] transition-all hover:border-[var(--accent)]/50 hover:bg-[var(--bg-card-hover)] hover:shadow-lg hover:shadow-orange-500/5"
    >
      <div className="flex h-40 items-center justify-center bg-[var(--bg-secondary)] p-6">
        <LessonIcon order={lesson.order} />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className="text-xs font-mono text-[var(--accent)]">
          Lesson {String(lesson.order).padStart(2, '0')}
        </span>
        <h3 className="text-sm font-semibold leading-snug text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
          {lesson.title}
        </h3>
      </div>
      {completed && (
        <div className="absolute top-3 right-3 flex h-6 w-6 items-center justify-center rounded-full bg-green-600 text-white text-xs">
          ✓
        </div>
      )}
    </Link>
  )
}

function LessonIcon({ order }: { readonly order: number }) {
  return (
    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--accent)]/10 text-[var(--accent)] text-2xl font-bold font-mono">
      {String(order).padStart(2, '0')}
    </div>
  )
}

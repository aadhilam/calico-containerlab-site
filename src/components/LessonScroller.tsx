'use client'

import { useMemo, useRef } from 'react'
import type { Lesson } from '@/lib/lessons'
import LessonCard from '@/components/LessonCard'

interface LessonScrollerProps {
  readonly lessons: Lesson[]
}

export default function LessonScroller({ lessons }: LessonScrollerProps) {
  const scrollerRef = useRef<HTMLDivElement>(null)

  const canScroll = useMemo(() => lessons.length > 4, [lessons.length])

  const scrollByAmount = (direction: 'left' | 'right') => {
    const el = scrollerRef.current
    if (!el) return
    const delta = direction === 'left' ? -360 : 360
    el.scrollBy({ left: delta, behavior: 'smooth' })
  }

  return (
    <div className="flex items-center gap-3">
      {canScroll && (
        <button
          type="button"
          onClick={() => scrollByAmount('left')}
          aria-label="Scroll lessons left"
          className="hidden shrink-0 rounded-full border border-[var(--border)] bg-[var(--bg-card-90)] p-2 text-[var(--text-secondary)] shadow-sm backdrop-blur hover:border-[var(--accent-40)] hover:text-[var(--text-primary)] md:inline-flex"
        >
          ←
        </button>
      )}

      <div
        ref={scrollerRef}
        className="flex flex-1 snap-x snap-mandatory gap-5 overflow-x-auto pb-2 pr-2"
      >
        {lessons.map((lesson) => (
          <div key={lesson.slug} className="w-64 shrink-0 snap-start sm:w-72">
            <LessonCard lesson={lesson} />
          </div>
        ))}
      </div>

      {canScroll && (
        <button
          type="button"
          onClick={() => scrollByAmount('right')}
          aria-label="Scroll lessons right"
          className="hidden shrink-0 rounded-full border border-[var(--border)] bg-[var(--bg-card-90)] p-2 text-[var(--text-secondary)] shadow-sm backdrop-blur hover:border-[var(--accent-40)] hover:text-[var(--text-primary)] md:inline-flex"
        >
          →
        </button>
      )}
    </div>
  )
}

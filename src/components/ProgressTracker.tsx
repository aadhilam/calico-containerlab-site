'use client'

import { useEffect, useRef, useState } from 'react'

interface ProgressTrackerProps {
  readonly slug: string
}

export default function ProgressTracker({ slug }: ProgressTrackerProps) {
  const [progress, setProgress] = useState(0)
  const markedComplete = useRef(false)

  useEffect(() => {
    markedComplete.current = false

    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      if (docHeight <= 0) return

      const percent = Math.min(100, Math.round((scrollTop / docHeight) * 100))
      setProgress(percent)

      if (percent >= 95 && !markedComplete.current) {
        markedComplete.current = true
        const stored = JSON.parse(localStorage.getItem('lesson-progress') ?? '{}')
        const updated = { ...stored, [slug]: true }
        localStorage.setItem('lesson-progress', JSON.stringify(updated))
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [slug])

  return (
    <div className="fixed top-0 left-0 z-[60] w-full">
      <div className="lesson-progress-bar" style={{ width: `${progress}%` }} />
    </div>
  )
}

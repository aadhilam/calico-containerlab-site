import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  getLessons,
  getLesson,
  fetchLessonContent,
  extractHeadings,
} from '@/lib/lessons'
import MarkdownRenderer from '@/components/MarkdownRenderer'
import TableOfContents from '@/components/TableOfContents'
import ProgressTracker from '@/components/ProgressTracker'
import LessonCard from '@/components/LessonCard'

interface LessonPageProps {
  readonly params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return getLessons().map((l) => ({ slug: l.slug }))
}

export async function generateMetadata({ params }: LessonPageProps) {
  const { slug } = await params
  const lesson = getLesson(slug)
  if (!lesson) return {}
  return {
    title: `${lesson.title} — Calico Labs`,
    description: `Hands-on lab: ${lesson.title}`,
  }
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { slug } = await params
  const lesson = getLesson(slug)
  if (!lesson) notFound()

  const content = await fetchLessonContent(slug)
  const headings = extractHeadings(content)

  const allLessons = getLessons()
  const otherLessons = allLessons.filter((l) => l.slug !== slug)
  const related = [
    ...otherLessons.filter(
      (l) => Math.abs(l.order - lesson.order) <= 2 && l.slug !== slug
    ),
    ...otherLessons.filter(
      (l) => Math.abs(l.order - lesson.order) > 2
    ),
  ].slice(0, 4)

  return (
    <>
      <ProgressTracker slug={slug} />
      <div className="mx-auto max-w-7xl px-6 py-8">
        <nav className="mb-6 text-sm text-[var(--text-secondary)]">
          <Link href="/" className="hover:text-[var(--accent)] transition-colors">
            Lessons
          </Link>
          <span className="mx-2">/</span>
          <span className="text-[var(--text-primary)]">{lesson.title}</span>
        </nav>

        <div className="flex gap-10">
          <article className="min-w-0 flex-1">
            <div className="mb-6">
              <span className="text-sm font-mono text-[var(--accent)]">
                Lesson {String(lesson.order).padStart(2, '0')}
              </span>
              <h1 className="mt-1 text-3xl font-bold">{lesson.title}</h1>
            </div>
            <MarkdownRenderer content={content} />
          </article>

          <aside className="hidden w-64 shrink-0 lg:block">
            <TableOfContents headings={headings} />
          </aside>
        </div>

        <section className="mt-16 border-t border-[var(--border)] pt-10">
          <h2 className="mb-6 text-xl font-semibold">Explore more lessons</h2>
          <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-4">
            {related.map((l) => (
              <LessonCard key={l.slug} lesson={l} />
            ))}
          </div>
        </section>
      </div>
    </>
  )
}

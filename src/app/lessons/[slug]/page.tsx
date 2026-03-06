import { notFound } from 'next/navigation'
import Link from 'next/link'
import { JetBrains_Mono, Noto_Sans_Math } from 'next/font/google'
import {
  getLessons,
  getLesson,
  fetchLessonContent,
  extractHeadings,
} from '@/lib/lessons'
import MarkdownRenderer from '@/components/MarkdownRenderer'
import TableOfContents from '@/components/TableOfContents'
import ProgressTracker from '@/components/ProgressTracker'
import LessonScroller from '@/components/LessonScroller'

const ipamSans = Noto_Sans_Math({
  variable: '--font-geist-sans',
  weight: '400',
  subsets: ['latin', 'math'],
  display: 'swap',
})

const ipamMono = JetBrains_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
})

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

  const fontVars =
    slug === '01-calico-ipam' ? `${ipamSans.variable} ${ipamMono.variable}` : undefined

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

  const explore = [
    ...related,
    ...otherLessons.filter((l) => !related.some((r) => r.slug === l.slug)),
  ]

  return (
    <div className={fontVars}>
      <ProgressTracker slug={slug} />
      <div className="mx-auto max-w-7xl lesson-shell-offset pl-12 pr-6 py-8">
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
              {lesson.youtubeId && (
                <div className="mt-6">
                  <div className="relative w-full overflow-hidden rounded-xl border border-[var(--border)] bg-black pt-[56.25%]">
                    <iframe
                      className="absolute inset-0 h-full w-full border-0"
                      src={`https://www.youtube-nocookie.com/embed/${lesson.youtubeId}?rel=0&playsinline=1&modestbranding=1`}
                      title={`${lesson.title} video`}
                      loading="eager"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                    />
                  </div>
                  <p className="mt-2 text-sm text-[var(--text-secondary)]">
                    If video stays blank in Safari,{' '}
                    <a
                      className="text-[var(--accent)] hover:underline"
                      href={`https://www.youtube.com/watch?v=${lesson.youtubeId}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      open it on YouTube
                    </a>
                    .
                  </p>
                </div>
              )}
            </div>
            <MarkdownRenderer content={content} />
          </article>

          <aside className="hidden w-80 shrink-0 lg:block xl:w-96">
            <TableOfContents headings={headings} />
          </aside>
        </div>

      </div>

      <section className="mt-16 border-t border-[var(--border)] bg-[var(--bg-secondary)]">
        <div className="mx-auto max-w-7xl lesson-shell-offset pl-12 pr-6 pt-10">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3 text-left">
            <div>
              <h2 className="text-xl font-semibold">Explore more lessons</h2>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                Scroll to see more
              </p>
            </div>
            <Link
              href="/"
              className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              View all lessons →
            </Link>
          </div>
        </div>

        <div className="pl-12 pr-6 pb-10">
          <LessonScroller lessons={explore} />
        </div>
      </section>
    </div>
  )
}

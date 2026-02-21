import { getLessons } from '@/lib/lessons'
import LessonCard from '@/components/LessonCard'
import { Montserrat } from 'next/font/google'

const headingFont = Montserrat({
  subsets: ['latin'],
  weight: ['800'],
  display: 'swap',
})

export default function Home() {
  const lessons = getLessons()

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <section className="mb-12 text-center">
        <h1 className={`${headingFont.className} mb-3 text-4xl font-extrabold tracking-tight text-[var(--accent)]`}>
          Kubernetes Networking with Calico
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-[var(--text-secondary)]">
          Hands-on labs using ContainerLab to master Calico networking concepts
          — from IPAM and pod routing to BGP, WireGuard, and Ingress TLS.
        </p>
      </section>

      <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {lessons.map((lesson) => (
          <LessonCard key={lesson.slug} lesson={lesson} />
        ))}
      </div>
    </div>
  )
}

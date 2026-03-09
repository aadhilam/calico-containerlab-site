import Link from 'next/link'
import { getLessons } from '@/lib/lessons'
import LessonCard from '@/components/LessonCard'

export default function Home() {
  const lessons = getLessons()

  return (
    <div className="mx-auto max-w-7xl pl-12 pr-6 py-12">
      <section className="mb-12 text-center">
        <h1 className="mb-3 text-4xl font-bold tracking-tight text-[var(--accent)]">
          Kubernetes Networking with Calico
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-[var(--text-secondary)]">
          Hands-on labs using ContainerLab to master Calico networking concepts
          — from IPAM and pod routing to BGP, WireGuard, and Ingress TLS.
        </p>
      </section>

      <section className="mb-10">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[var(--text-secondary)]">
          Before You Begin
        </p>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/repo-setup"
            className="group flex items-start gap-5 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5 transition-all hover:border-[var(--accent-50)] hover:bg-[var(--bg-card-hover)] hover:shadow-lg hover:shadow-orange-500/5 sm:max-w-sm"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-10)] text-[var(--accent)]">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
                <path d="M9 18c-4.51 2-5-2-7-2"/>
              </svg>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-mono font-semibold text-[var(--accent)]">SETUP</span>
              <h2 className="text-sm font-semibold leading-snug text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                Set Up the Repository
              </h2>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Clone the repo and configure the lab environment before starting the lessons.
              </p>
            </div>
          </Link>

          <a
            href="https://docs.tigera.io/"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-start gap-5 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5 transition-all hover:border-[var(--accent-50)] hover:bg-[var(--bg-card-hover)] hover:shadow-lg hover:shadow-orange-500/5 sm:max-w-sm"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-10)] text-[var(--accent)]">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
              </svg>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-mono font-semibold text-[var(--accent)]">DOCS</span>
              <h2 className="text-sm font-semibold leading-snug text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                Calico Documentation
              </h2>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Explore the official Calico docs for in-depth reference and configuration guides.
              </p>
            </div>
          </a>
          <a
            href="https://www.tigera.io/project-calico/community/"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-start gap-5 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5 transition-all hover:border-[var(--accent-50)] hover:bg-[var(--bg-card-hover)] hover:shadow-lg hover:shadow-orange-500/5 sm:max-w-sm"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-10)] text-[var(--accent)]">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-mono font-semibold text-[var(--accent)]">COMMUNITY</span>
              <h2 className="text-sm font-semibold leading-snug text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                Join the Calico Community
              </h2>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Connect with fellow users, ask questions, and stay up to date with the latest from Project Calico.
              </p>
            </div>
          </a>
        </div>
      </section>

      <p className="mb-5 text-xs font-semibold uppercase tracking-widest text-[var(--text-secondary)]">
        Lessons
      </p>

      <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {lessons.map((lesson) => (
          <LessonCard key={lesson.slug} lesson={lesson} />
        ))}
      </div>
    </div>
  )
}

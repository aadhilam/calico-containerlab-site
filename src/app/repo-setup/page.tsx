import Link from 'next/link'
import { fetchRepoSetupContent, extractHeadings } from '@/lib/lessons'
import MarkdownRenderer from '@/components/MarkdownRenderer'
import TableOfContents from '@/components/TableOfContents'

export const metadata = {
  title: 'Repo Setup — Calico Labs',
  description: 'Clone and configure the k8-networking-calico-containerlab repository before starting the labs',
}

export default async function RepoSetupPage() {
  const content = await fetchRepoSetupContent()
  const headings = extractHeadings(content)

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <nav className="mb-6 text-sm text-[var(--text-secondary)]">
        <Link href="/" className="hover:text-[var(--accent)] transition-colors">
          Lessons
        </Link>
        <span className="mx-2">/</span>
        <span className="text-[var(--text-primary)]">Repo Setup</span>
      </nav>

      <div className="flex gap-10">
        <article className="min-w-0 flex-1">
          <MarkdownRenderer content={content} />
        </article>

        <aside className="hidden w-72 shrink-0 lg:block xl:w-80">
          <TableOfContents headings={headings} />
        </aside>
      </div>
    </div>
  )
}

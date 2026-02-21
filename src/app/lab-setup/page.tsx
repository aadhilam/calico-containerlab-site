import Link from 'next/link'
import { fetchLabSetupContent, extractHeadings } from '@/lib/lessons'
import MarkdownRenderer from '@/components/MarkdownRenderer'
import TableOfContents from '@/components/TableOfContents'

export const metadata = {
  title: 'Lab Setup — Calico Labs',
  description: 'How to deploy and configure the ContainerLab environment for Calico networking labs',
}

export default async function LabSetupPage() {
  const content = await fetchLabSetupContent()
  const headings = extractHeadings(content)

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <nav className="mb-6 text-sm text-[var(--text-secondary)]">
        <Link href="/" className="hover:text-[var(--accent)] transition-colors">
          Lessons
        </Link>
        <span className="mx-2">/</span>
        <span className="text-[var(--text-primary)]">Lab Setup</span>
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

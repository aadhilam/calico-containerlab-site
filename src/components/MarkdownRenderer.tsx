'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeSlug from 'rehype-slug'
import rehypeHighlight from 'rehype-highlight'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

interface MarkdownRendererProps {
  readonly content: string
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const themeClass = mounted ? (resolvedTheme === 'dark' ? 'prose-dark' : 'prose-light') : 'prose-light'

  return (
    <div className={`prose-common ${themeClass}`}>

      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSlug, rehypeHighlight]}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

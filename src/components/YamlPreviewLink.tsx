'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

interface YamlPreviewLinkProps {
  readonly href: string
  readonly children: React.ReactNode
}

const HOVER_DELAY_MS = 200
const DISMISS_DELAY_MS = 150
const YAML_CACHE = new Map<string, string>()

function highlightYaml(raw: string): string {
  return raw
    .split('\n')
    .map((line) => {
      if (/^\s*#/.test(line)) {
        return `<span class="yaml-comment">${escapeHtml(line)}</span>`
      }

      const keyMatch = line.match(/^(\s*)([\w./-]+)(:)(.*)$/)
      if (keyMatch) {
        const [, indent, key, colon, rest] = keyMatch
        return `${escapeHtml(indent)}<span class="yaml-key">${escapeHtml(key)}</span><span class="yaml-colon">${colon}</span>${highlightValue(rest)}`
      }

      const listMatch = line.match(/^(\s*-\s)(.*)$/)
      if (listMatch) {
        const [, dash, rest] = listMatch
        return `<span class="yaml-dash">${escapeHtml(dash)}</span>${highlightValue(rest)}`
      }

      return escapeHtml(line)
    })
    .join('\n')
}

function highlightValue(raw: string): string {
  const trimmed = raw.trim()
  if (!trimmed) return escapeHtml(raw)

  if (/^#/.test(trimmed)) {
    return `<span class="yaml-comment">${escapeHtml(raw)}</span>`
  }

  const inlineComment = raw.match(/^(.+?)(\s+#.*)$/)
  if (inlineComment) {
    return `${highlightValue(inlineComment[1])}<span class="yaml-comment">${escapeHtml(inlineComment[2])}</span>`
  }

  if (/^(["']).*\1$/.test(trimmed)) {
    return `<span class="yaml-string">${escapeHtml(raw)}</span>`
  }

  if (/^(true|false|yes|no|on|off)$/i.test(trimmed)) {
    return `<span class="yaml-bool">${escapeHtml(raw)}</span>`
  }

  if (/^null$/i.test(trimmed) || trimmed === '~') {
    return `<span class="yaml-null">${escapeHtml(raw)}</span>`
  }

  if (/^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(trimmed)) {
    return `<span class="yaml-number">${escapeHtml(raw)}</span>`
  }

  return escapeHtml(raw)
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function toRawUrl(blobUrl: string): string {
  return blobUrl
    .replace('github.com', 'raw.githubusercontent.com')
    .replace('/blob/', '/')
}

export default function YamlPreviewLink({ href, children }: YamlPreviewLinkProps) {
  const [content, setContent] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [visible, setVisible] = useState(false)
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const linkRef = useRef<HTMLAnchorElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)

  const fetchYaml = useCallback(async () => {
    const cached = YAML_CACHE.get(href)
    if (cached) {
      setContent(cached)
      return
    }

    setLoading(true)
    try {
      const controller = new AbortController()
      abortRef.current = controller
      const rawUrl = toRawUrl(href)
      const res = await fetch(rawUrl, { signal: controller.signal })
      if (!res.ok) {
        setContent('Failed to load preview.')
        return
      }
      const text = await res.text()
      YAML_CACHE.set(href, text)
      setContent(text)
    } catch (error: unknown) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      setContent('Failed to load preview.')
    } finally {
      setLoading(false)
    }
  }, [href])

  const cancelDismiss = useCallback(() => {
    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current)
      dismissTimerRef.current = null
    }
  }, [])

  const scheduleDismiss = useCallback(() => {
    cancelDismiss()
    dismissTimerRef.current = setTimeout(() => {
      abortRef.current?.abort()
      abortRef.current = null
      setVisible(false)
    }, DISMISS_DELAY_MS)
  }, [cancelDismiss])

  const handleLinkEnter = useCallback(() => {
    cancelDismiss()
    hoverTimerRef.current = setTimeout(() => {
      setVisible(true)
      fetchYaml()
    }, HOVER_DELAY_MS)
  }, [fetchYaml, cancelDismiss])

  const handleLinkLeave = useCallback(() => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current)
      hoverTimerRef.current = null
    }
    scheduleDismiss()
  }, [scheduleDismiss])

  const handlePopoverEnter = useCallback(() => {
    cancelDismiss()
  }, [cancelDismiss])

  const handlePopoverLeave = useCallback(() => {
    scheduleDismiss()
  }, [scheduleDismiss])

  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current)
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current)
      abortRef.current?.abort()
    }
  }, [])

  useEffect(() => {
    if (!visible || !popoverRef.current || !linkRef.current) return
    const link = linkRef.current
    const popover = popoverRef.current
    const linkRect = link.getBoundingClientRect()
    const popoverRect = popover.getBoundingClientRect()
    const viewportWidth = window.innerWidth

    if (linkRect.left + popoverRect.width > viewportWidth - 16) {
      popover.style.left = 'auto'
      popover.style.right = '0'
    }
  }, [visible, content])

  return (
    <span className="yaml-preview-wrapper">
      <a
        ref={linkRef}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={handleLinkEnter}
        onMouseLeave={handleLinkLeave}
      >
        {children}
        <span className="yaml-preview-hint" aria-hidden="true">{'\u25B8'}</span>
      </a>
      {visible && (
        <div
          ref={popoverRef}
          className="yaml-preview-popover"
          onMouseEnter={handlePopoverEnter}
          onMouseLeave={handlePopoverLeave}
        >
          {loading && !content && (
            <div className="yaml-preview-loading">Loading...</div>
          )}
          {content && (
            <code className="yaml-preview-code" dangerouslySetInnerHTML={{ __html: highlightYaml(content) }} />
          )}
        </div>
      )}
    </span>
  )
}

'use client'

import React from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeSlug from 'rehype-slug'

interface MarkdownRendererProps {
  readonly content: string
}

type CalloutType = 'note' | 'tip' | 'important' | 'warning' | 'caution'
type SiteThemeKey = 'dark' | 'light'

const CALLOUT_TITLES: Record<CalloutType, string> = {
  note: 'Note',
  tip: 'Tip',
  important: 'Important',
  warning: 'Warning',
  caution: 'Caution',
}

const MERMAID_THEME_VARIABLES: Record<SiteThemeKey, Record<string, string>> = {
  dark: {
    background: '#0d1117',
    textColor: '#e6edf3',
    primaryColor: '#1c2128',
    primaryTextColor: '#e6edf3',
    primaryBorderColor: '#4b5563',
    secondaryColor: '#252c35',
    secondaryTextColor: '#e6edf3',
    secondaryBorderColor: '#4b5563',
    tertiaryColor: '#161b22',
    tertiaryTextColor: '#c9d1d9',
    tertiaryBorderColor: '#3f4954',
    mainBkg: '#1c2128',
    secondBkg: '#252c35',
    tertiaryBkg: '#161b22',
    lineColor: '#8b949e',
    clusterBkg: '#3a3f45',
    clusterBorder: '#69737d',
    edgeLabelBackground: '#0d1117',
    nodeTextColor: '#e6edf3',
    titleColor: '#f0f6fc',
  },
  light: {
    background: '#f6f8fa',
    textColor: '#1f2328',
    primaryColor: '#ffffff',
    primaryTextColor: '#1f2328',
    primaryBorderColor: '#9aa4af',
    secondaryColor: '#ffffff',
    secondaryTextColor: '#1f2328',
    secondaryBorderColor: '#9aa4af',
    tertiaryColor: '#eef2f6',
    tertiaryTextColor: '#1f2328',
    tertiaryBorderColor: '#b6bec7',
    mainBkg: '#ffffff',
    secondBkg: '#f8fafc',
    tertiaryBkg: '#eef2f6',
    lineColor: '#57606a',
    clusterBkg: '#eef2f6',
    clusterBorder: '#8c959f',
    edgeLabelBackground: '#ffffff',
    nodeTextColor: '#1f2328',
    titleColor: '#1f2328',
  },
}

const MERMAID_FLOWCHART_CONFIG = {
  htmlLabels: false,
  subGraphTitleMargin: {
    top: 4,
    bottom: 12,
  },
  wrappingWidth: 500,
} as const

const MERMAID_BASE_CONFIG = {
  startOnLoad: false,
  securityLevel: 'loose',
  theme: 'base',
  markdownAutoWrap: false,
} as const

const MERMAID_MIN_TEXT_CONTRAST = 4.5
const MERMAID_TEXT_LIGHT_RGB = { r: 230, g: 237, b: 243, a: 1 }
const MERMAID_TEXT_DARK_RGB = { r: 31, g: 35, b: 40, a: 1 }
const MERMAID_FALLBACK_CANVAS_RGB = { r: 13, g: 17, b: 23, a: 1 }
const MERMAID_SHAPE_SELECTOR = 'rect, polygon, ellipse, circle, path'

type RgbaColor = {
  r: number
  g: number
  b: number
  a: number
}

function getSiteThemeKey(root: Element): SiteThemeKey {
  return root.getAttribute('data-theme') === 'light' ? 'light' : 'dark'
}

function createMermaidConfig(themeKey: SiteThemeKey) {
  return {
    ...MERMAID_BASE_CONFIG,
    themeVariables: MERMAID_THEME_VARIABLES[themeKey],
    flowchart: {
      ...MERMAID_FLOWCHART_CONFIG,
    },
  }
}

function getChildren(node: unknown): unknown[] | null {
  if (!node || typeof node !== 'object') return null
  const children = (node as { children?: unknown }).children
  return Array.isArray(children) ? children : null
}

function isTextNode(node: unknown): node is { type: 'text'; value: string } {
  return (
    !!node &&
    typeof node === 'object' &&
    (node as { type?: unknown }).type === 'text' &&
    typeof (node as { value?: unknown }).value === 'string'
  )
}

function isElementNode(node: unknown, tagName?: string): node is {
  type: 'element'
  tagName: string
  children?: unknown[]
} {
  if (!node || typeof node !== 'object') return false
  if ((node as { type?: unknown }).type !== 'element') return false
  const tn = (node as { tagName?: unknown }).tagName
  if (typeof tn !== 'string') return false
  return tagName ? tn === tagName : true
}

function getTextContent(node: unknown): string {
  if (!node) return ''
  if (isTextNode(node)) return node.value
  const children = getChildren(node)
  if (children) return children.map(getTextContent).join('')
  return ''
}

function parseCalloutMarker(raw: string): { type: CalloutType; rest: string } | null {
  const match = raw.trim().match(/^[\[{]!([A-Za-z]+)[\]}]\s*(.*)$/)
  if (!match) return null
  const maybeType = match[1].toLowerCase()
  if (!(maybeType in CALLOUT_TITLES)) return null
  return { type: maybeType as CalloutType, rest: match[2] ?? '' }
}

function stripCalloutFromReactChildren(
  children: React.ReactNode
): { callout: { type: CalloutType; rest: string }; stripped: React.ReactNode[] } | null {
  const childArray = React.Children.toArray(children)
  for (let i = 0; i < childArray.length; i++) {
    const child = childArray[i]
    if (typeof child !== 'string') continue
    const callout = parseCalloutMarker(child)
    if (!callout) continue

    const stripped = [...childArray]
    if (callout.rest) stripped[i] = callout.rest
    else stripped.splice(i, 1)

    return { callout, stripped }
  }
  return null
}

function isParagraphElement(
  node: unknown
): node is React.ReactElement<{ children?: React.ReactNode }> {
  return React.isValidElement(node) && node.type === 'p'
}

function promoteMermaidLabelLayers(container: HTMLDivElement | null) {
  if (!container) return
  const svg = container.querySelector('svg')
  if (!svg) return

  // Flowchart renderers use different container group structures.
  // Promote edgeLabels in any parent group where it exists.
  const allGroups = svg.querySelectorAll('g')
  for (const parentGroup of allGroups) {
    const directGroups = Array.from(parentGroup.children).filter(
      (child): child is SVGGElement => child instanceof SVGGElement
    )
    const edgeLabelsLayer = directGroups.find((group) =>
      group.classList.contains('edgeLabels')
    )
    if (edgeLabelsLayer) {
      parentGroup.appendChild(edgeLabelsLayer)
    }
  }

  // Move cluster labels into a top overlay group per container so nested
  // child clusters cannot paint over parent cluster titles.
  const labelsByContainer = new Map<SVGGElement, SVGGElement[]>()
  const clusterLabels = svg.querySelectorAll('g.cluster > g.cluster-label')
  for (const label of clusterLabels) {
    if (!(label instanceof SVGGElement)) continue
    const clusterGroup = label.parentElement
    const containerGroup = clusterGroup?.parentElement
    if (!(containerGroup instanceof SVGGElement)) continue
    const existing = labelsByContainer.get(containerGroup) ?? []
    existing.push(label)
    labelsByContainer.set(containerGroup, existing)
  }

  for (const [containerGroup, labels] of labelsByContainer.entries()) {
    const directGroups = Array.from(containerGroup.children).filter(
      (child): child is SVGGElement => child instanceof SVGGElement
    )
    let overlay = directGroups.find((group) =>
      group.classList.contains('clusterLabelsOverlay')
    )

    if (!overlay) {
      overlay = document.createElementNS('http://www.w3.org/2000/svg', 'g')
      overlay.setAttribute('class', 'clusterLabelsOverlay')
      containerGroup.appendChild(overlay)
    }

    for (const label of labels) {
      overlay.appendChild(label)
    }
  }
}

function clampChannel(value: number): number {
  return Math.max(0, Math.min(255, value))
}

function clampAlpha(value: number): number {
  return Math.max(0, Math.min(1, value))
}

function parseRgbChannel(raw: string): number | null {
  const value = raw.trim()
  if (!value) return null
  if (value.endsWith('%')) {
    const percent = Number.parseFloat(value.slice(0, -1))
    if (!Number.isFinite(percent)) return null
    return clampChannel((percent / 100) * 255)
  }

  const numeric = Number.parseFloat(value)
  if (!Number.isFinite(numeric)) return null
  return clampChannel(numeric)
}

function parseAlphaChannel(raw: string): number | null {
  const value = raw.trim()
  if (!value) return null
  if (value.endsWith('%')) {
    const percent = Number.parseFloat(value.slice(0, -1))
    if (!Number.isFinite(percent)) return null
    return clampAlpha(percent / 100)
  }

  const numeric = Number.parseFloat(value)
  if (!Number.isFinite(numeric)) return null
  return clampAlpha(numeric)
}

function parseCssColor(rawColor: string): RgbaColor | null {
  const color = rawColor.trim()
  if (!color || color === 'none' || color === 'transparent' || color.startsWith('url(')) {
    return null
  }

  const hexMatch = color.match(/^#([0-9a-f]+)$/i)
  if (hexMatch) {
    const hex = hexMatch[1]
    if (hex.length === 3 || hex.length === 4) {
      const r = Number.parseInt(hex[0] + hex[0], 16)
      const g = Number.parseInt(hex[1] + hex[1], 16)
      const b = Number.parseInt(hex[2] + hex[2], 16)
      const a = hex.length === 4 ? Number.parseInt(hex[3] + hex[3], 16) / 255 : 1
      return { r, g, b, a }
    }
    if (hex.length === 6 || hex.length === 8) {
      const r = Number.parseInt(hex.slice(0, 2), 16)
      const g = Number.parseInt(hex.slice(2, 4), 16)
      const b = Number.parseInt(hex.slice(4, 6), 16)
      const a = hex.length === 8 ? Number.parseInt(hex.slice(6, 8), 16) / 255 : 1
      return { r, g, b, a }
    }
  }

  const fnMatch = color.match(/^rgba?\((.+)\)$/i)
  if (!fnMatch) return null
  const content = fnMatch[1].trim()

  if (content.includes(',')) {
    const parts = content.split(',').map((part) => part.trim())
    if (parts.length < 3) return null
    const r = parseRgbChannel(parts[0])
    const g = parseRgbChannel(parts[1])
    const b = parseRgbChannel(parts[2])
    if (r === null || g === null || b === null) return null
    const a = parts.length >= 4 ? parseAlphaChannel(parts[3]) : 1
    if (a === null) return null
    return { r, g, b, a }
  }

  const slashParts = content.split('/').map((part) => part.trim())
  const rgbParts = slashParts[0].split(/\s+/).filter(Boolean)
  if (rgbParts.length < 3) return null
  const r = parseRgbChannel(rgbParts[0])
  const g = parseRgbChannel(rgbParts[1])
  const b = parseRgbChannel(rgbParts[2])
  if (r === null || g === null || b === null) return null
  const a = slashParts[1] ? parseAlphaChannel(slashParts[1]) : 1
  if (a === null) return null
  return { r, g, b, a }
}

function blendColors(foreground: RgbaColor, background: RgbaColor): RgbaColor {
  const alpha = clampAlpha(foreground.a)
  const inverse = 1 - alpha
  return {
    r: Math.round(foreground.r * alpha + background.r * inverse),
    g: Math.round(foreground.g * alpha + background.g * inverse),
    b: Math.round(foreground.b * alpha + background.b * inverse),
    a: 1,
  }
}

function toLinearChannel(value: number): number {
  const normalized = clampChannel(value) / 255
  return normalized <= 0.03928
    ? normalized / 12.92
    : ((normalized + 0.055) / 1.055) ** 2.4
}

function getRelativeLuminance(color: RgbaColor): number {
  const r = toLinearChannel(color.r)
  const g = toLinearChannel(color.g)
  const b = toLinearChannel(color.b)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function getContrastRatio(colorA: RgbaColor, colorB: RgbaColor): number {
  const lumA = getRelativeLuminance(colorA)
  const lumB = getRelativeLuminance(colorB)
  const lighter = Math.max(lumA, lumB)
  const darker = Math.min(lumA, lumB)
  return (lighter + 0.05) / (darker + 0.05)
}

function resolveCanvasColor(): RgbaColor {
  const rootStyles = getComputedStyle(document.documentElement)
  const bgFromVar = parseCssColor(rootStyles.getPropertyValue('--bg-primary'))
  if (bgFromVar) return bgFromVar

  const bodyBg = parseCssColor(getComputedStyle(document.body).backgroundColor)
  if (bodyBg) return bodyBg

  return MERMAID_FALLBACK_CANVAS_RGB
}

function resolveElementFillColor(element: SVGElement | null, canvasColor: RgbaColor): RgbaColor | null {
  if (!element) return null
  const candidates = [
    element.getAttribute('fill'),
    element.style.fill,
    getComputedStyle(element).fill,
  ]

  for (const candidate of candidates) {
    if (!candidate) continue
    const parsed = parseCssColor(candidate)
    if (!parsed) continue
    if (parsed.a <= 0) continue
    return parsed.a < 1 ? blendColors(parsed, canvasColor) : { ...parsed, a: 1 }
  }

  return null
}

function findGroupBackgroundColor(group: ParentNode, canvasColor: RgbaColor): RgbaColor | null {
  const shapes = group.querySelectorAll<SVGElement>(MERMAID_SHAPE_SELECTOR)
  for (const shape of shapes) {
    const fill = resolveElementFillColor(shape, canvasColor)
    if (fill) return fill
  }
  return null
}

function resolveTextColor(element: Element, canvasColor: RgbaColor): RgbaColor | null {
  if (!(element instanceof SVGElement || element instanceof HTMLElement)) return null
  const styles = getComputedStyle(element)
  const parsed = parseCssColor(styles.fill) ?? parseCssColor(styles.color)
  if (!parsed) return null
  if (parsed.a <= 0) return null
  return parsed.a < 1 ? blendColors(parsed, canvasColor) : { ...parsed, a: 1 }
}

function setTextColor(element: Element, color: string) {
  if (element instanceof SVGElement) {
    element.style.setProperty('fill', color, 'important')
    element.style.setProperty('color', color, 'important')
    element.setAttribute('fill', color)
    return
  }

  if (element instanceof HTMLElement) {
    element.style.setProperty('color', color, 'important')
    element.style.setProperty('fill', color, 'important')
  }
}

function enforceGroupTextContrast(group: ParentNode, background: RgbaColor, canvasColor: RgbaColor) {
  const textNodes = group.querySelectorAll('text, tspan, foreignObject p, foreignObject span')
  if (textNodes.length === 0) return

  const lightContrast = getContrastRatio(MERMAID_TEXT_LIGHT_RGB, background)
  const darkContrast = getContrastRatio(MERMAID_TEXT_DARK_RGB, background)
  const preferredColor = lightContrast >= darkContrast ? '#e6edf3' : '#1f2328'

  for (const textNode of textNodes) {
    const currentColor = resolveTextColor(textNode, canvasColor)
    if (!currentColor) continue
    const currentContrast = getContrastRatio(currentColor, background)
    if (currentContrast >= MERMAID_MIN_TEXT_CONTRAST) continue
    setTextColor(textNode, preferredColor)
  }
}

function enforceMermaidTextContrast(container: HTMLDivElement | null) {
  if (!container) return
  const svg = container.querySelector('svg')
  if (!svg) return

  const canvasColor = resolveCanvasColor()

  const nodeGroups = svg.querySelectorAll('g.node')
  for (const group of nodeGroups) {
    if (!(group instanceof SVGGElement)) continue
    const background = findGroupBackgroundColor(group, canvasColor)
    if (!background) continue
    enforceGroupTextContrast(group, background, canvasColor)
  }

  const clusterGroups = svg.querySelectorAll('g.cluster')
  for (const cluster of clusterGroups) {
    if (!(cluster instanceof SVGGElement)) continue
    const clusterRect = Array.from(cluster.children).find(
      (child): child is SVGElement =>
        child instanceof SVGElement && child.tagName.toLowerCase() === 'rect'
    )
    const background = resolveElementFillColor(clusterRect, canvasColor)
    if (!background) continue
    const label = cluster.querySelector('g.cluster-label')
    if (!label) continue
    enforceGroupTextContrast(label, background, canvasColor)
  }

  const edgeLabels = svg.querySelectorAll('g.edgeLabel')
  for (const edgeLabel of edgeLabels) {
    if (!(edgeLabel instanceof SVGGElement)) continue
    const rect = edgeLabel.querySelector<SVGElement>('rect')
    const background = resolveElementFillColor(rect, canvasColor) ?? canvasColor
    enforceGroupTextContrast(edgeLabel, background, canvasColor)
  }
}

function MermaidDiagram({ chart }: { chart: string }) {
  const [svg, setSvg] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [themeKey, setThemeKey] = useState<SiteThemeKey>('dark')
  const containerRef = useRef<HTMLDivElement>(null)
  const renderId = useMemo(
    () => `mermaid-${Math.random().toString(36).slice(2, 10)}`,
    []
  )

  useEffect(() => {
    const root = document.documentElement
    const nextTheme = getSiteThemeKey(root)
    setThemeKey(nextTheme)

    const observer = new MutationObserver(() => {
      const updatedTheme = getSiteThemeKey(root)
      setThemeKey(updatedTheme)
    })

    observer.observe(root, { attributes: true, attributeFilter: ['data-theme'] })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    let active = true

    const render = async () => {
      try {
        if (typeof document !== 'undefined' && 'fonts' in document) {
          await document.fonts.ready
        }

        const mermaid = (await import('mermaid')).default
        mermaid.initialize(createMermaidConfig(themeKey))
        const { svg: rendered } = await mermaid.render(renderId, chart)
        if (!active) return
        setError(null)
        setSvg(rendered)
      } catch {
        if (!active) return
        setSvg('')
        setError('Unable to render Mermaid diagram.')
      }
    }

    render()

    return () => {
      active = false
    }
  }, [chart, renderId, themeKey])

  useEffect(() => {
    if (!svg) return
    const container = containerRef.current
    enforceMermaidTextContrast(container)
    promoteMermaidLabelLayers(container)
  }, [svg])

  if (error) {
    return (
      <pre>
        <code>{chart}</code>
      </pre>
    )
  }

  if (!svg) {
    return <div className="mermaid-loading">Rendering diagram…</div>
  }

  return (
    <div
      ref={containerRef}
      className="mermaid-diagram"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSlug]}
        components={{
          pre({ children, ...props }) {
            const childArray = React.Children.toArray(children)
            if (
              childArray.length === 1 &&
              React.isValidElement(childArray[0]) &&
              childArray[0].type === MermaidDiagram
            ) {
              return <>{children}</>
            }

            return <pre {...props}>{children}</pre>
          },
          blockquote({ node, children, ...props }) {
            const firstChild = getChildren(node)?.[0]
            const isFirstParagraph = isElementNode(firstChild, 'p')
            const firstParagraphText = isFirstParagraph ? getTextContent(firstChild) : ''
            const callout = parseCalloutMarker(firstParagraphText)

            if (!callout) {
              return (
                <blockquote {...props}>
                  {children}
                </blockquote>
              )
            }

            const childArray = React.Children.toArray(children)
            const firstBlock = childArray[0]
            const remainingBlocks = childArray.slice(1)
            let bodyBlocks: React.ReactNode[] = remainingBlocks

            if (isParagraphElement(firstBlock)) {
              const stripped = stripCalloutFromReactChildren(firstBlock.props.children)
              if (stripped) {
                bodyBlocks = [<p key="callout-first">{stripped.stripped}</p>, ...remainingBlocks]
              } else if (callout.rest.trim()) {
                bodyBlocks = [<p key="callout-first">{callout.rest.trim()}</p>, ...remainingBlocks]
              }
            } else if (callout.rest.trim()) {
              bodyBlocks = [<p key="callout-first">{callout.rest.trim()}</p>, ...remainingBlocks]
            }

            return (
              <div className={`md-alert md-alert-${callout.type}`}>
                <div className="md-alert-title">{CALLOUT_TITLES[callout.type]}</div>
                <div className="md-alert-body">
                  {bodyBlocks}
                </div>
              </div>
            )
          },
          p({ children, ...props }) {
            const stripped = stripCalloutFromReactChildren(children)
            if (!stripped) return <p {...props}>{children}</p>

            return (
              <div className={`md-alert md-alert-${stripped.callout.type}`}>
                <div className="md-alert-title">{CALLOUT_TITLES[stripped.callout.type]}</div>
                <div className="md-alert-body">
                  <p>{stripped.stripped}</p>
                </div>
              </div>
            )
          },
          li({ children, className, ...props }) {
            const childArray = React.Children.toArray(children)
            const firstBlock = childArray[0]
            const remainingBlocks = childArray.slice(1)

            let stripped: ReturnType<typeof stripCalloutFromReactChildren> = null
            let strippedFromFirstParagraph = false
            if (isParagraphElement(firstBlock)) {
              stripped = stripCalloutFromReactChildren(firstBlock.props.children)
              strippedFromFirstParagraph = !!stripped
            } else {
              stripped = stripCalloutFromReactChildren(children)
            }

            if (!stripped) return <li className={className} {...props}>{children}</li>

            const bodyBlocks: React.ReactNode[] = strippedFromFirstParagraph
              ? [<p key="callout-first">{stripped.stripped}</p>, ...remainingBlocks]
              : [<p key="callout-first">{stripped.stripped}</p>]
            const mergedClassName = [className, 'md-alert-item'].filter(Boolean).join(' ')
            return (
              <li className={mergedClassName} {...props}>
                <div className={`md-alert md-alert-${stripped.callout.type}`}>
                  <div className="md-alert-title">{CALLOUT_TITLES[stripped.callout.type]}</div>
                  <div className="md-alert-body">{bodyBlocks}</div>
                </div>
              </li>
            )
          },
          a({ href, children, ...props }) {
            return (
              <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
                {children}
              </a>
            )
          },
          code({ className, children, ...props }) {
            const isMermaid = /(^|\s)language-mermaid(\s|$)/.test(className ?? '')
            if (isMermaid) {
              return <MermaidDiagram chart={String(children).replace(/\n$/, '')} />
            }

            return (
              <code className={className} {...props}>
                {children}
              </code>
            )
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

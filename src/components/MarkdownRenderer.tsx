'use client'

import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeSlug from 'rehype-slug'

interface MarkdownRendererProps {
  readonly content: string
}

type CalloutType = 'note' | 'tip' | 'important' | 'warning' | 'caution'

const CALLOUT_TITLES: Record<CalloutType, string> = {
  note: 'Note',
  tip: 'Tip',
  important: 'Important',
  warning: 'Warning',
  caution: 'Caution',
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

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSlug]}
        components={{
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
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

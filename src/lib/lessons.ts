const REPO_OWNER = 'aadhilam'
const REPO_NAME = 'k8-networking-calico-containerlab'
const BRANCH = 'master'
const BASE_PATH = 'containerlab'
const CONTENT_REVALIDATE_SECONDS = 60
const LAB_SETUP_VIDEOS = [
  {
    title: 'Lab Setup',
    videoId: 'r72rNLBYkeU',
  },
  {
    title: 'Lab Folder Structure',
    videoId: 'ucsppQ9Fdh0',
  },
] as const

export interface Lesson {
  slug: string
  title: string
  description: string
  order: number
  image: string
  youtubeId?: string
}

const LESSON_META: Record<string, { title: string; description: string; image: string; youtubeId?: string }> = {
  '01-calico-ipam': {
    title: 'Calico IPAM',
    description: 'Explore how Calico assigns pod IPs using IP pools and block affinity.',
    image: '/images/ipam-2.png',
    youtubeId: 'G-IGFsMSmrA',
  },
  '02-pod-network': { title: 'Pod Networking', description: 'Understand how pods communicate within a node using the Calico CNI plugin.', image: '/images/pod-3.png', youtubeId: 'jiwlbJiwmHM' },
  '03-pod-routing': { title: 'Pod Routing Across Nodes', description: 'Learn how traffic is routed between pods on different nodes using host routing.', image: '/images/routing-2.png', youtubeId: 'V3QYtAYrac4' },
  '04-k8s-services': { title: 'Kubernetes Services - ClusterIP', description: 'Deep dive into how ClusterIP services route traffic via iptables and kube-proxy.', image: '/images/clusterip-2.png', youtubeId: 'qRA3wSmoqss' },
  '05-k8s-dns': { title: 'Kubernetes DNS', description: 'Explore CoreDNS and how Kubernetes resolves service names to cluster IPs.', image: '/images/dns-2.png', youtubeId: 'XJ8u11_hLyI' },
  '06-calico-overlay': { title: 'Calico Overlay Networks', description: 'Configure VXLAN and IP-in-IP overlays for cross-subnet pod communication.', image: '/images/overlay-2.png', youtubeId: 'x3GJoqEo6lc' },
  '07-calico-bgp': { title: 'Calico BGP', description: 'Set up BGP peering between Calico nodes to exchange pod routes dynamically.', image: '/images/bgp-2.png', youtubeId: 'rDI7oSLLGzU' },
  '08-calico-bgp-lb': { title: 'LoadBalancer & BGP Advertisements', description: 'Advertise LoadBalancer service IPs to external networks via BGP.', image: '/images/lb-2.png', youtubeId: '5jQWFfuweZo' },
  '09-multi-ippool': { title: 'Multiple IPPools', description: 'Create and assign multiple IP pools to segregate workloads by namespace or node.', image: '/images/ippool-2.png', youtubeId: '-Y3kkAa_TBk' },
  '10-calico-bgp-ippool': { title: 'Advertise IPPool via BGP', description: 'Announce pod IP ranges to upstream routers for direct external pod access.', image: '/images/advertise-ippool-2.png', youtubeId: '_hn1y_JgsfE' },
  '11-headless-services': { title: 'Headless Services', description: 'Use headless services to discover individual pod IPs directly via DNS.', image: '/images/ep-3.png', youtubeId: '73or5ff9Y5Q' },
  '12-calico-qos': { title: 'Network QoS - Bandwidth Limiting', description: 'Apply ingress and egress bandwidth limits to pods using Calico annotations.', image: '/images/qos-2.png', youtubeId: 'WKBzkADsFvA' },
  '13-wireguard': { title: 'WireGuard Encryption', description: 'Enable transparent WireGuard encryption for all pod-to-pod traffic in the cluster.', image: '/images/wg-4.png', youtubeId: 'oNV1ggQ4iAU' },
  '14-calico-ipv6': { title: 'IPv4 & IPv6 Dual-Stack', description: 'Configure Calico for dual-stack networking with both IPv4 and IPv6 pod addresses.', image: '/images/ipv6-3.png', youtubeId: 'DE05mq4U4gY' },
  '15-selective-bgp-peering': { title: 'Selective BGP Peering', description: 'Control which nodes peer with which BGP neighbors using node selectors.', image: '/images/selective-bgp-4.png', youtubeId: 'z3Ht0ACBEgc' },
  '16-static-ip': { title: 'Static IPs for Pods', description: 'Assign fixed IP addresses to specific pods using Calico IPAM annotations.', image: '/images/ip-2.png', youtubeId: 'qinELDyRRso' },
  '17-nodelocal-dnscache': { title: 'NodeLocal DNSCache', description: 'Speed up DNS resolution by running a local DNS cache daemonset on every node.', image: '/images/dns-cache-4.png', youtubeId: 'iT7c3zVnkXA' },
  '18-mtu': { title: 'MTU Configuration', description: 'Tune MTU settings across your cluster to optimise throughput and avoid fragmentation.', image: '/images/mtu-4.png', youtubeId: 'tPFq6cRw1ec' },
  '19-calico-ingress': { title: 'Calico Ingress', description: 'Configure Ingress resources with Calico network policy for fine-grained traffic control.', image: '/images/ingress-4.png', youtubeId: 'ZOsdo0RADzQ' },
  '20-ingress-tls': { title: 'Ingress TLS', description: 'Secure Ingress endpoints with TLS certificates issued by cert-manager.', image: '/images/tls-3.png', youtubeId: 'lh1IOcmnS98' },
}

export function getLessons(): Lesson[] {
  return Object.entries(LESSON_META).map(([slug, meta]) => ({
    slug,
    title: meta.title,
    description: meta.description,
    order: parseInt(slug.split('-')[0], 10),
    image: meta.image,
    youtubeId: meta.youtubeId,
  }))
}

export function getLesson(slug: string): Lesson | undefined {
  const meta = LESSON_META[slug]
  if (!meta) return undefined
  return {
    slug,
    title: meta.title,
    description: meta.description,
    order: parseInt(slug.split('-')[0], 10),
    image: meta.image,
    youtubeId: meta.youtubeId,
  }
}

export async function fetchLessonContent(slug: string): Promise<string> {
  const readmeVariants = ['README.md', 'Readme.md', 'readme.md']

  for (const filename of readmeVariants) {
    const url = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}/${BASE_PATH}/${slug}/${filename}`
    const res = await fetch(url, { next: { revalidate: CONTENT_REVALIDATE_SECONDS } })
    if (res.ok) {
      const text = await res.text()
      return rewriteUrls(text, slug)
    }
  }

  throw new Error(`README not found for lesson: ${slug}`)
}

function rewriteUrls(markdown: string, slug: string): string {
  const rawBase = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}/${BASE_PATH}/${slug}`
  const blobBase = `https://github.com/${REPO_OWNER}/${REPO_NAME}/blob/${BRANCH}/${BASE_PATH}/${slug}`
  return markdown
    // Rewrite relative image paths to absolute raw.githubusercontent.com URLs
    .replace(
      /!\[([^\]]*)\]\((?!https?:\/\/)([^)]+)\)/g,
      (_, alt, path) => `![${alt}](${rawBase}/${path})`
    )
    // Rewrite relative src in HTML <img> tags
    .replace(
      /(<img\s[^>]*?src=["'])(?!https?:\/\/)([^"']+)(["'])/gi,
      (_, before, path, quote) => `${before}${rawBase}/${path}${quote}`
    )
    // Rewrite ../readme.md links → /lab-setup
    .replace(
      /\[([^\]]*)\]\(\.\.\/readme\.md(#[^)]*?)?\)/gi,
      (_, text, hash) => `[${text}](/lab-setup${hash ?? ''})`
    )
    // Rewrite ../sibling-lesson/README.md links → /lessons/sibling-lesson
    .replace(
      /\[([^\]]*)\]\(\.\.\/([^/\s)]+)\/(?:README|Readme|readme)\.md(#[^)]*?)?\)/gi,
      (_, text, siblingSlug, hash) => `[${text}](/lessons/${siblingSlug}${hash ?? ''})`
    )
    // Rewrite other relative file links (yaml, sh, conf, etc.) → GitHub blob viewer
    .replace(
      /\[([^\]]*)\]\((?!https?:\/\/)(?!\/)([^)]+)\)/g,
      (_, text, path) => `[${text}](${blobBase}/${path})`
    )
}

export async function fetchRepoSetupContent(): Promise<string> {
  const url = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}/readme.md`
  const res = await fetch(url, { next: { revalidate: CONTENT_REVALIDATE_SECONDS } })
  if (!res.ok) throw new Error('Repo setup README not found')
  const text = await res.text()
  const base = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}`
  return text
    .replace(
      /!\[([^\]]*)\]\((?!https?:\/\/)([^)]+)\)/g,
      (_, alt, path) => `![${alt}](${base}/${path})`
    )
    .replace(
      /\[([^\]]*)\]\(containerlab\/([\w-]+)\/?[^)]*\)/g,
      (_, text, slug) => `[${text}](/lessons/${slug})`
    )
}

export async function fetchLabSetupContent(): Promise<string> {
  const url = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}/${BASE_PATH}/readme.md`
  const res = await fetch(url, { next: { revalidate: CONTENT_REVALIDATE_SECONDS } })
  if (!res.ok) {
    throw new Error('Lab setup README not found')
  }
  const text = await res.text()
  const base = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}/${BASE_PATH}`
  const rewritten = text.replace(
    /!\[([^\]]*)\]\((?!https?:\/\/)([^)]+)\)/g,
    (_, alt, path) => `![${alt}](${base}/${path})`
  )
  return replaceLabSetupVideoWalkthroughSection(rewritten)
}

export function extractHeadings(markdown: string): { id: string; text: string; level: number }[] {
  const stripped = markdown.replace(/```[\s\S]*?```/g, '')
  const headingRegex = /^(#{1,4})\s+(.+)$/gm
  const headings: { id: string; text: string; level: number }[] = []
  const seenIds = new Map<string, number>()
  let match

  while ((match = headingRegex.exec(stripped)) !== null) {
    const text = match[2].trim()
    const baseId =
      text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-') || 'section'
    const currentCount = seenIds.get(baseId) ?? 0
    const id = currentCount === 0 ? baseId : `${baseId}-${currentCount}`
    seenIds.set(baseId, currentCount + 1)
    headings.push({ id, text, level: match[1].length })
  }

  return headings
}

function replaceLabSetupVideoWalkthroughSection(markdown: string): string {
  const headingMatch = markdown.match(/^(#{1,6})\s+Video Walkthrough\s*$/im)
  if (!headingMatch || headingMatch.index === undefined) {
    return `${markdown.trimEnd()}\n\n${buildLabSetupVideoWalkthroughSection(2)}`
  }

  const headingLevel = headingMatch[1].length
  const sectionStart = headingMatch.index
  const sectionBodyStart = sectionStart + headingMatch[0].length
  const rest = markdown.slice(sectionBodyStart)
  const nextHeadingRegex = new RegExp(`^#{1,${headingLevel}}\\s+`, 'm')
  const nextHeadingMatch = rest.match(nextHeadingRegex)
  const sectionEnd =
    nextHeadingMatch && nextHeadingMatch.index !== undefined
      ? sectionBodyStart + nextHeadingMatch.index
      : markdown.length

  return (
    markdown.slice(0, sectionStart) +
    buildLabSetupVideoWalkthroughSection(headingLevel) +
    markdown.slice(sectionEnd)
  )
}

function buildLabSetupVideoWalkthroughSection(headingLevel: number): string {
  const heading = '#'.repeat(headingLevel)
  const subheading = '#'.repeat(Math.min(headingLevel + 1, 6))
  const lines = [`${heading} Video Walkthrough`, '']

  for (const { title, videoId } of LAB_SETUP_VIDEOS) {
    lines.push(`${subheading} ${title}`)
    lines.push('')
    lines.push('<div class="youtube-embed">')
    lines.push(
      `  <iframe src="https://www.youtube-nocookie.com/embed/${videoId}?rel=0&playsinline=1&modestbranding=1" title="${title} Video Walkthrough" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`
    )
    lines.push('</div>')
    lines.push('')
  }

  return lines.join('\n')
}

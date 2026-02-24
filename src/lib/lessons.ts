const REPO_OWNER = 'aadhilam'
const REPO_NAME = 'k8-networking-calico-containerlab'
const BRANCH = 'master'
const BASE_PATH = 'containerlab'

export interface Lesson {
  slug: string
  title: string
  order: number
  image: string
  youtubeId?: string
}

const LESSON_META: Record<string, { title: string; image: string; youtubeId?: string }> = {
  '01-calico-ipam': {
    title: 'Calico IPAM',
    image: '/images/ipam-2.png',
    youtubeId: 'G-IGFsMSmrA',
  },
  '02-pod-network': { title: 'Pod Networking', image: '/images/pod-3.png', youtubeId: 'jiwlbJiwmHM' },
  '03-pod-routing': { title: 'Pod Routing Across Nodes', image: '/images/routing-2.png', youtubeId: 'V3QYtAYrac4' },
  '04-k8s-services': { title: 'Kubernetes Services - ClusterIP', image: '/images/clusterip-2.png', youtubeId: 'qRA3wSmoqss' },
  '05-k8s-dns': { title: 'Kubernetes DNS', image: '/images/dns-2.png', youtubeId: 'XJ8u11_hLyI' },
  '06-calico-overlay': { title: 'Calico Overlay Networks', image: '/images/overlay-2.png', youtubeId: 'x3GJoqEo6lc' },
  '07-calico-bgp': { title: 'Calico BGP', image: '/images/bgp-2.png', youtubeId: 'rDI7oSLLGzU' },
  '08-calico-bgp-lb': { title: 'LoadBalancer & BGP Advertisements', image: '/images/lb-2.png', youtubeId: '5jQWFfuweZo' },
  '09-multi-ippool': { title: 'Multiple IPPools', image: '/images/ippool-2.png', youtubeId: '-Y3kkAa_TBk' },
  '10-calico-bgp-ippool': { title: 'Advertise IPPool via BGP', image: '/images/advertise-ippool-2.png', youtubeId: '_hn1y_JgsfE' },
  '11-headless-services': { title: 'Headless Services', image: '/images/ep-2.png', youtubeId: '73or5ff9Y5Q' },
  '12-calico-qos': { title: 'Network QoS - Bandwidth Limiting', image: '/images/qos-2.png', youtubeId: 'WKBzkADsFvA' },
  '13-wireguard': { title: 'WireGuard Encryption', image: '/images/wg-2.png', youtubeId: 'oNV1ggQ4iAU' },
  '14-calico-ipv6': { title: 'IPv4 & IPv6 Dual-Stack', image: '/images/ipv6-3.png', youtubeId: 'DE05mq4U4gY' },
  '15-selective-bgp-peering': { title: 'Selective BGP Peering', image: '/images/selective-bgp-2.png', youtubeId: 'z3Ht0ACBEgc' },
  '16-static-ip': { title: 'Static IPs for Pods', image: '/images/ip-2.png', youtubeId: 'qinELDyRRso' },
  '17-nodelocal-dnscache': { title: 'NodeLocal DNSCache', image: '/images/dns-cache-4.png', youtubeId: 'iT7c3zVnkXA' },
  '18-mtu': { title: 'MTU Configuration', image: '/images/mtu-3.png', youtubeId: 'tPFq6cRw1ec' },
  '19-calico-ingress': { title: 'Calico Ingress', image: '/images/ingress-2.png', youtubeId: 'ZOsdo0RADzQ' },
  '20-ingress-tls': { title: 'Ingress TLS', image: '/images/tls-2.png', youtubeId: 'lh1IOcmnS98' },
}

export function getLessons(): Lesson[] {
  return Object.entries(LESSON_META).map(([slug, meta]) => ({
    slug,
    title: meta.title,
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
    order: parseInt(slug.split('-')[0], 10),
    image: meta.image,
    youtubeId: meta.youtubeId,
  }
}

export async function fetchLessonContent(slug: string): Promise<string> {
  const readmeVariants = ['README.md', 'Readme.md', 'readme.md']

  for (const filename of readmeVariants) {
    const url = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}/${BASE_PATH}/${slug}/${filename}`
    const res = await fetch(url, { next: { revalidate: 3600 } })
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
  const res = await fetch(url, { next: { revalidate: 3600 } })
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
  const res = await fetch(url, { next: { revalidate: 3600 } })
  if (!res.ok) {
    throw new Error('Lab setup README not found')
  }
  const text = await res.text()
  const base = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}/${BASE_PATH}`
  return text.replace(
    /!\[([^\]]*)\]\((?!https?:\/\/)([^)]+)\)/g,
    (_, alt, path) => `![${alt}](${base}/${path})`
  )
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

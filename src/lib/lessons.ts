const REPO_OWNER = 'aadhilam'
const REPO_NAME = 'k8-networking-calico-containerlab'
const BRANCH = 'master'
const BASE_PATH = 'containerlab'

export interface Lesson {
  slug: string
  title: string
  order: number
  image: string
}

const LESSON_META: Record<string, { title: string; image: string }> = {
  '01-calico-ipam': { title: 'Calico IPAM', image: '/images/ipam.svg' },
  '02-pod-network': { title: 'Pod Networking', image: '/images/pod-network.svg' },
  '03-pod-routing': { title: 'Pod Routing Across Nodes', image: '/images/routing.svg' },
  '04-k8s-services': { title: 'Kubernetes Services - ClusterIP', image: '/images/services.svg' },
  '05-k8s-dns': { title: 'Kubernetes DNS', image: '/images/dns.svg' },
  '06-calico-overlay': { title: 'Calico Overlay Networks', image: '/images/overlay.svg' },
  '07-calico-bgp': { title: 'Calico BGP', image: '/images/bgp.svg' },
  '08-calico-bgp-lb': { title: 'LoadBalancer & BGP Advertisements', image: '/images/loadbalancer.svg' },
  '09-multi-ippool': { title: 'Multiple IPPools', image: '/images/ippool.svg' },
  '10-calico-bgp-ippool': { title: 'Advertise IPPool via BGP', image: '/images/bgp-ippool.svg' },
  '11-headless-services': { title: 'Headless Services', image: '/images/headless.svg' },
  '12-calico-qos': { title: 'Network QoS - Bandwidth Limiting', image: '/images/qos.svg' },
  '13-wireguard': { title: 'WireGuard Encryption', image: '/images/wireguard.svg' },
  '14-calico-ipv6': { title: 'IPv4 & IPv6 Dual-Stack', image: '/images/ipv6.svg' },
  '15-selective-bgp-peering': { title: 'Selective BGP Peering', image: '/images/bgp-peering.svg' },
  '16-static-ip': { title: 'Static IPs for Pods', image: '/images/static-ip.svg' },
  '17-nodelocal-dnscache': { title: 'NodeLocal DNSCache', image: '/images/dnscache.svg' },
  '18-mtu': { title: 'MTU Configuration', image: '/images/mtu.svg' },
  '19-calico-ingress': { title: 'Calico Ingress', image: '/images/ingress.svg' },
  '20-ingress-tls': { title: 'Ingress TLS', image: '/images/tls.svg' },
}

export function getLessons(): Lesson[] {
  return Object.entries(LESSON_META).map(([slug, meta]) => ({
    slug,
    title: meta.title,
    order: parseInt(slug.split('-')[0], 10),
    image: meta.image,
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
  }
}

export async function fetchLessonContent(slug: string): Promise<string> {
  const readmeVariants = ['README.md', 'Readme.md', 'readme.md']

  for (const filename of readmeVariants) {
    const url = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}/${BASE_PATH}/${slug}/${filename}`
    const res = await fetch(url, { next: { revalidate: 3600 } })
    if (res.ok) {
      const text = await res.text()
      return rewriteImageUrls(text, slug)
    }
  }

  throw new Error(`README not found for lesson: ${slug}`)
}

function rewriteImageUrls(markdown: string, slug: string): string {
  const base = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}/${BASE_PATH}/${slug}`
  return markdown.replace(
    /!\[([^\]]*)\]\((?!https?:\/\/)([^)]+)\)/g,
    (_, alt, path) => `![${alt}](${base}/${path})`
  )
}

export function extractHeadings(markdown: string): { id: string; text: string; level: number }[] {
  const stripped = markdown.replace(/```[\s\S]*?```/g, '')
  const headingRegex = /^(#{1,4})\s+(.+)$/gm
  const headings: { id: string; text: string; level: number }[] = []
  let match

  while ((match = headingRegex.exec(stripped)) !== null) {
    const text = match[2].trim()
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
    headings.push({ id, text, level: match[1].length })
  }

  return headings
}

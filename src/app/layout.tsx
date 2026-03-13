import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import Script from "next/script"
import "./globals.css"
import ThemeToggle from "@/components/ThemeToggle"
import VisitorTracker from "@/components/VisitorTracker"
import Link from "next/link"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Calico Kubernetes Networking Labs",
  description:
    "Learn Calico networking for Kubernetes with hands-on ContainerLab exercises",
  icons: {
    icon: "/favicon.svg",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <Script id="theme-init" strategy="beforeInteractive">{`
(() => {
  try {
    const stored = localStorage.getItem('theme');
    const systemPrefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
    const theme = stored === 'light' || stored === 'dark'
      ? stored
      : (systemPrefersLight ? 'light' : 'dark');
    document.documentElement.dataset.theme = theme;
  } catch {}
})();
        `}</Script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--bg-secondary-80)] backdrop-blur-md" style={{ WebkitBackdropFilter: 'blur(12px)' }}>
          <div className="mx-auto flex max-w-7xl items-center justify-between pl-12 pr-6 py-3">
            <Link href="/" className="flex items-center gap-2 text-lg font-bold text-[var(--accent)]">
              Kubernetes Networking Labs
            </Link>
            <nav className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
              <Link href="/" className="hover:text-[var(--text-primary)] transition-colors">
                Lessons
              </Link>
              <a
                href="https://github.com/aadhilam/k8-networking-calico-containerlab"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[var(--text-primary)] transition-colors"
              >
                GitHub
              </a>
              <ThemeToggle />
            </nav>
          </div>
        </header>
        <VisitorTracker />
        <main>{children}</main>
      </body>
    </html>
  )
}

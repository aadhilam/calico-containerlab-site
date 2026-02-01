import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

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
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--bg-secondary)]/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
            <a href="/" className="flex items-center gap-2 text-lg font-bold text-[var(--accent)]">
              <img src="https://avatars.githubusercontent.com/u/12304728?s=200&v=4" alt="Calico" width={28} height={28} className="rounded" />
              Calico Labs
            </a>
            <nav className="flex items-center gap-4 text-sm text-[var(--text-secondary)]">
              <a href="/" className="hover:text-[var(--text-primary)] transition-colors">
                Lessons
              </a>
              <a
                href="https://github.com/aadhilam/k8-networking-calico-containerlab"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[var(--text-primary)] transition-colors"
              >
                GitHub
              </a>
            </nav>
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  )
}

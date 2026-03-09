"use client"

import { useState } from "react"

export default function GatePage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/gate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Something went wrong")
        return
      }

      window.location.href = "/"
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-60px)] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-8">
        <div className="mb-6 text-center">
          <img
            src="https://avatars.githubusercontent.com/u/12304728?s=200&v=4"
            alt="Calico"
            width={48}
            height={48}
            className="mx-auto mb-4 rounded"
          />
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Kubernetes Networking
            <br />
            Calico Community Labs
          </h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Enter your email to access the learning hub
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-[var(--text-secondary)]"
            >
              Email address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-2.5 text-[var(--text-primary)] placeholder-[var(--text-secondary)] outline-none transition-colors focus:border-[var(--accent)]"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[var(--accent)] px-4 py-2.5 font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Continue"}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-[var(--text-secondary)]">
          Your email is only used to track access. No spam.
        </p>
      </div>
    </div>
  )
}

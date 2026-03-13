"use client"

import { useEffect } from "react"

export default function VisitorTracker() {
  useEffect(() => {
    if (sessionStorage.getItem("tracked")) return
    sessionStorage.setItem("tracked", "1")
    fetch("/api/track", { method: "POST" }).catch(() => {})
  }, [])

  return null
}

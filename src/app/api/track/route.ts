import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    if (process.env.NEXT_PUBLIC_ENABLE_GATE === "true") {
      return NextResponse.json({ ok: true })
    }

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "unknown"
    const userAgent = request.headers.get("user-agent") ?? "unknown"
    const referrer = request.headers.get("referer") ?? null
    const country =
      request.headers.get("x-nf-country") ??
      request.headers.get("x-country") ??
      null
    const city = request.headers.get("x-nf-city") ?? null
    const region = request.headers.get("x-nf-region") ?? null

    let org: string | null = null
    const isLocalIp =
      !ip ||
      ip === "unknown" ||
      ip === "127.0.0.1" ||
      ip === "::1" ||
      ip.startsWith("192.168.") ||
      ip.startsWith("10.")

    if (!isLocalIp) {
      try {
        const token = process.env.IPINFO_TOKEN
        const url = token
          ? `https://ipinfo.io/${ip}?token=${token}`
          : `https://ipinfo.io/${ip}/json`
        const res = await fetch(url, { signal: AbortSignal.timeout(3000) })
        if (res.ok) {
          const data = await res.json()
          org = data.org ?? null
        }
      } catch {
        // non-critical, continue without org
      }
    }

    await supabase.from("site_visitors").insert({
      email: null,
      ip_address: ip,
      user_agent: userAgent,
      referrer,
      country,
      city,
      region,
      org,
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: true })
  }
}

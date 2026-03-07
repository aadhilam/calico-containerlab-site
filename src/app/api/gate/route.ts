import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : ""

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 })
    }

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      ?? request.headers.get("x-real-ip")
      ?? "unknown"
    const userAgent = request.headers.get("user-agent") ?? "unknown"
    const referrer = request.headers.get("referer") ?? null
    const country = request.headers.get("x-country")
      ?? request.headers.get("x-nf-country")
      ?? null

    const { error } = await supabase.from("site_visitors").insert({
      email,
      ip_address: ip,
      user_agent: userAgent,
      referrer,
      country,
    })

    if (error) {
      console.error("Supabase insert error:", error)
      return NextResponse.json({ error: "Failed to save. Please try again." }, { status: 500 })
    }

    const response = NextResponse.json({ success: true })
    response.cookies.set("site_access", "granted", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: "/",
    })

    return response
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}

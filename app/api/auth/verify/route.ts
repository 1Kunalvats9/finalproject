import { NextResponse } from "next/server"
import { verifyToken, getTokenFromRequest } from "@/lib/auth"
import { getUserById } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const token = getTokenFromRequest(request)

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    const user = await getUserById(payload.userId)
    if (!user) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    })
  } catch (error) {
    console.error("Verify error:", error)
    return NextResponse.json({ authenticated: false }, { status: 500 })
  }
}


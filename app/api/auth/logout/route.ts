import { NextResponse } from "next/server"

export async function POST() {
  // Stateless logout: client should discard its token
  return NextResponse.json({ success: true }, { status: 200 })
}


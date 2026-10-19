import { NextResponse } from 'next/server'
import { checkPassword, createSession, SESSION_COOKIE } from '@/lib/auth'

export async function POST(req: Request) {
  const { password } = (await req.json().catch(() => ({}))) as { password?: string }
  if (!process.env.ADMIN_PASSWORD) return NextResponse.json({ error: 'not-configured' }, { status: 503 })
  if (!password || !(await checkPassword(password))) {
    await new Promise((r) => setTimeout(r, 800)) // slow down guessing
    return NextResponse.json({ error: 'wrong' }, { status: 401 })
  }
  const s = await createSession()
  const res = NextResponse.json({ ok: true })
  res.cookies.set(SESSION_COOKIE, s.value, { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: s.maxAge })
  return res
}

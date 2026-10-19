import { NextResponse } from 'next/server'
import { getContentFresh } from '@/lib/store'

export const dynamic = 'force-dynamic'

/** Idempotent: creates the stored content (and copies client logos from the old site) only if it does not exist yet. */
export async function POST() {
  const c = await getContentFresh()
  return NextResponse.json({ ok: true, clients: c.clients.map((x) => x.logo.startsWith('http')) })
}

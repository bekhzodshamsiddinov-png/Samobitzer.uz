import { NextResponse } from 'next/server'
import { listLeads, updateLead } from '@/lib/store'
import type { LeadStatus } from '@/lib/types'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json(await listLeads(), { headers: { 'cache-control': 'no-store' } })
}

export async function PATCH(req: Request) {
  const { id, status, note } = (await req.json().catch(() => ({}))) as { id?: string; status?: LeadStatus; note?: string }
  if (!id || !/^[0-9a-f-]{36}$/.test(id)) return NextResponse.json({ error: 'bad id' }, { status: 400 })
  const patch: { status?: LeadStatus; note?: string } = {}
  if (status && ['new', 'progress', 'done'].includes(status)) patch.status = status
  if (typeof note === 'string') patch.note = note.slice(0, 2000)
  try {
    return NextResponse.json(await updateLead(id, patch))
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getContentFresh, saveContent } from '@/lib/store'
import type { Content } from '@/lib/types'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json(await getContentFresh(), { headers: { 'cache-control': 'no-store' } })
}

export async function PUT(req: Request) {
  const body = (await req.json().catch(() => null)) as Content | null
  if (!body || !body.settings || !Array.isArray(body.products) || !Array.isArray(body.categories) || !body.texts) {
    return NextResponse.json({ error: 'invalid content' }, { status: 400 })
  }
  try {
    await saveContent(body)
    revalidatePath('/', 'layout')
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}

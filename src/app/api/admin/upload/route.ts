import { NextResponse } from 'next/server'
import { uploadMedia } from '@/lib/store'

const ALLOWED = ['image/webp', 'image/jpeg', 'image/png', 'image/svg+xml', 'image/gif']

export async function POST(req: Request) {
  const form = await req.formData().catch(() => null)
  const file = form?.get('file')
  if (!(file instanceof File)) return NextResponse.json({ error: 'no file' }, { status: 400 })
  if (!ALLOWED.includes(file.type)) return NextResponse.json({ error: 'type' }, { status: 415 })
  if (file.size > 4 * 1024 * 1024) return NextResponse.json({ error: 'too large' }, { status: 413 })
  try {
    const url = await uploadMedia(file.name, await file.arrayBuffer(), file.type)
    return NextResponse.json({ url })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
